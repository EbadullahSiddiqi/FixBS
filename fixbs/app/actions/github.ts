"use server";

import { Octokit } from "octokit";
import { analyzeFiles } from "@/lib/ast/analyze";
import { buildDependencyGraph } from "@/lib/ast/resolver";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type RepositoryFile = {
  path: string;
  name: string;
  sha: string;
  size: number;
  content: string;
};

export type SkippedFile = {
  path: string;
  size: number;
  reason: string;
};

export type RepositoryStats = {
  totalTreeItems: number;
  relevantFiles: number;
  downloadedFiles: number;
  skippedFiles: number;
  totalSize: number;
};

export type Repository = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  private: boolean;

  files: RepositoryFile[];

  skippedFiles: SkippedFile[];

  stats: RepositoryStats;

  dependencyGraph: {
    nodes: any[];
    edges: any[];
    externalDependencies: any[];
  };
};

/*
|--------------------------------------------------------------------------
| File safety configuration
|--------------------------------------------------------------------------
*/

/*
| Maximum size of a single file that FixBS will ingest.
|
| 500 KB is a reasonable starting point.
|
| Later, we can make this configurable.
*/

const MAX_FILE_SIZE = 500 * 1024;

/*
|--------------------------------------------------------------------------
| Directories that FixBS should completely ignore
|--------------------------------------------------------------------------
*/

const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".cache",
];

/*
|--------------------------------------------------------------------------
| File extensions FixBS currently understands
|
| We're starting with JS/TS because these are the languages
| we'll build the first AST parser for.
|--------------------------------------------------------------------------
*/

const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

/*
|--------------------------------------------------------------------------
| Get user's repositories
|--------------------------------------------------------------------------
*/

export async function getUserRepositories(accessToken: string) {
  const octokit = new Octokit({
    auth: accessToken,
  });

  const response = await octokit.request("GET /user/repos", {
    type: "all",

    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return response.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    description: repo.description,
    private: repo.private,
  }));
}

/*
|--------------------------------------------------------------------------
| Get repository information
|--------------------------------------------------------------------------
*/

export async function getRepositoryInfo(
  accessToken: string,
  owner: string,
  repo: string,
) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repository: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      owner: data.owner.login,
      defaultBranch: data.default_branch,
      private: data.private,
    };
  } catch (error) {
    console.error("Error fetching repository information:", error);

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Get complete repository tree
|--------------------------------------------------------------------------
*/

export async function getRepositoryTree(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch repository tree: ${response.statusText}`,
      );
    }

    const data = await response.json();

    return data.tree;
  } catch (error) {
    console.error("Error fetching repository tree:", error);

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Existing directory/file contents function
|
| Keep this because your dashboard still uses it.
|--------------------------------------------------------------------------
*/

export async function getRepositoryContents(
  accessToken: string,
  owner: string,
  repo: string,
  path: string = "",
) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contents: ${response.statusText}`);
    }

    const data = await response.json();

    /*
    | GitHub returned a file
    */

    if (!Array.isArray(data) && data.type === "file") {
      const textCode = Buffer.from(data.content, "base64").toString("utf-8");

      return {
        type: "file",
        name: data.name,
        path: data.path,
        content: textCode,
      };
    }

    /*
    | GitHub returned a directory
    */

    return {
      type: "dir",
      items: data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        sha: item.sha,
      })),
    };
  } catch (error) {
    console.error("Error reading repository contents:", error);

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Determine whether a path belongs to an ignored directory
|--------------------------------------------------------------------------
*/

function isIgnoredDirectory(path: string) {
  const parts = path.split("/");

  return parts.some((part) => IGNORED_DIRECTORIES.includes(part));
}

/*
|--------------------------------------------------------------------------
| Determine whether a file has a supported extension
|--------------------------------------------------------------------------
*/

function hasAllowedExtension(path: string) {
  return ALLOWED_EXTENSIONS.some((extension) =>
    path.toLowerCase().endsWith(extension),
  );
}

/*
|--------------------------------------------------------------------------
| Determine whether a file is text
|
| GitHub's tree API gives us file size and SHA, but doesn't give
| us reliable binary information.
|
| So we'll perform a lightweight check after downloading it.
|--------------------------------------------------------------------------
*/

function isProbablyBinary(buffer: Buffer) {
  /*
  | Look at the first 8 KB.
  |
  | If we encounter a null byte, it's very likely binary data.
  */

  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));

  return sample.includes(0);
}

/*
|--------------------------------------------------------------------------
| Get ONE repository file
|--------------------------------------------------------------------------
*/

export async function getRepositoryFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file ${path}: ${response.statusText}`);
    }

    const data = await response.json();

    /*
    | Make sure GitHub actually returned a file.
    */

    if (Array.isArray(data) || data.type !== "file") {
      return {
        success: false as const,
        reason: "not-a-file",
      };
    }

    /*
    | GitHub normally provides the file size in bytes.
    */

    const size = data.size ?? 0;

    /*
    | Safety check #1:
    | Don't download/process enormous files.
    */

    if (size > MAX_FILE_SIZE) {
      return {
        success: false as const,
        reason: `file-too-large:${size}`,
      };
    }

    /*
    | GitHub returns the contents as base64.
    */

    if (!data.content) {
      return {
        success: false as const,
        reason: "no-content",
      };
    }

    /*
    | Decode base64 into bytes first.
    */

    const buffer = Buffer.from(data.content, "base64");

    /*
    | Safety check #2:
    | Detect obvious binary files.
    */

    if (isProbablyBinary(buffer)) {
      return {
        success: false as const,
        reason: "binary-file",
      };
    }

    /*
    | Convert bytes into UTF-8 text.
    */

    const content = buffer.toString("utf-8");

    return {
      success: true as const,

      file: {
        path: data.path,
        name: data.name,
        content,
        size,
      },
    };
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);

    return {
      success: false as const,
      reason: "fetch-error",
    };
  }
}

/*
|--------------------------------------------------------------------------
| INGEST ENTIRE REPOSITORY
|--------------------------------------------------------------------------
*/

export async function ingestRepository(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<Repository | null> {
  try {
    console.log(`Starting ingestion: ${owner}/${repo}`);

    /*
    |--------------------------------------------------
    | 1. Repository information
    |--------------------------------------------------
    */

    const repository = await getRepositoryInfo(accessToken, owner, repo);

    if (!repository) {
      throw new Error("Repository not found");
    }

    console.log(`Default branch: ${repository.defaultBranch}`);

    /*
    |--------------------------------------------------
    | 2. Complete repository tree
    |--------------------------------------------------
    */

    const tree = await getRepositoryTree(
      accessToken,
      owner,
      repo,
      repository.defaultBranch,
    );

    if (!tree) {
      throw new Error("Could not fetch repository tree");
    }

    console.log(`Total tree items: ${tree.length}`);

    /*
    |--------------------------------------------------
    | 3. Filter relevant files
    |--------------------------------------------------
    */

    const files = tree.filter(
      (item: any) =>
        item.type === "blob" &&
        !isIgnoredDirectory(item.path) &&
        hasAllowedExtension(item.path),
    );

    console.log(`Relevant files: ${files.length}`);

    /*
    |--------------------------------------------------
    | 4. Download files concurrently
    |--------------------------------------------------
    */

    const CONCURRENCY = 5;

    const filesWithContent: RepositoryFile[] = [];

    const skippedFiles: SkippedFile[] = [];

    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY);

      const results = await Promise.all(
        batch.map(async (file: any) => {
          const result = await getRepositoryFile(
            accessToken,
            owner,
            repo,
            file.path,
          );

          return {
            treeFile: file,
            result,
          };
        }),
      );

      /*
      | Process results from this batch.
      */

      for (const { treeFile, result } of results) {
        if (!result.success) {
          skippedFiles.push({
            path: treeFile.path,
            size: treeFile.size ?? 0,
            reason: result.reason,
          });

          continue;
        }

        filesWithContent.push({
          path: result.file.path,
          name: result.file.name,
          sha: treeFile.sha,
          size: result.file.size,
          content: result.file.content,
        });
      }

      console.log(
        `Downloaded ${
          Math.min(i + CONCURRENCY, files.length) - skippedFiles.length
        }/${files.length} files`,
      );
    }

    /*
    |--------------------------------------------------
    | 5. Calculate statistics
    |--------------------------------------------------
    */

    const totalSize = filesWithContent.reduce(
      (total, file) => total + file.size,
      0,
    );

    const stats: RepositoryStats = {
      totalTreeItems: tree.length,
      relevantFiles: files.length,
      downloadedFiles: filesWithContent.length,
      skippedFiles: skippedFiles.length,
      totalSize,
    };

    /*
    |--------------------------------------------------
    | 6. Log results
    |--------------------------------------------------
    */

    console.log(`Successfully downloaded: ${stats.downloadedFiles} files`);

    /*
    |--------------------------------------------------------------------------
    | AST analysis
    |--------------------------------------------------------------------------
    */

    const parsedFiles = analyzeFiles(filesWithContent);

    console.log(`Successfully parsed: ${parsedFiles.length} files`);

    /*
|--------------------------------------------------------------------------
| Build dependency graph
|--------------------------------------------------------------------------
*/

    const dependencyGraph = buildDependencyGraph(parsedFiles);

    // console.log(
    //   "Dependency edges:",
    //   JSON.stringify(dependencyGraph.edges, null, 2),
    // );

    // console.log(
    //   "External dependencies:",
    //   JSON.stringify(dependencyGraph.externalDependencies, null, 2),
    // );

    console.log("Dependency graph:", JSON.stringify(dependencyGraph, null, 2));

    console.log("Parsed files:", JSON.stringify(parsedFiles, null, 2));

    console.log(`Skipped: ${stats.skippedFiles} files`);

    console.log(`Total source size: ${stats.totalSize} bytes`);

    if (skippedFiles.length > 0) {
      console.log("Skipped files:", skippedFiles);
    }

    /*
    |--------------------------------------------------
    | 7. Return complete repository
    |--------------------------------------------------
    */
    return {
      id: repository.id,
      name: repository.name,
      fullName: repository.fullName,
      owner: repository.owner,
      defaultBranch: repository.defaultBranch,
      private: repository.private,

      files: filesWithContent,

      skippedFiles,

      stats,

      dependencyGraph,
    };
  } catch (error) {
    console.error("Repository ingestion failed:", error);

    return null;
  }
}
