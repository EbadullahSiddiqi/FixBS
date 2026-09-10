import path from "path";
import type { ParsedFile, ParsedImport } from "./parser";

/*
|--------------------------------------------------------------------------
| Supported extensions
|--------------------------------------------------------------------------
*/

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

/*
|--------------------------------------------------------------------------
| Dependency Edge
|--------------------------------------------------------------------------
|
| Represents:
|
| App.jsx
|    |
|    └──> Navbar.jsx
|
|--------------------------------------------------------------------------
*/

export type DependencyEdge = {
  from: string;
  to: string;
  imports: string[];
};

/*
|--------------------------------------------------------------------------
| External Dependency
|--------------------------------------------------------------------------
|
| Represents packages such as:
|
| react
| react-router-dom
| @google/generative-ai
|
|--------------------------------------------------------------------------
*/

export type ExternalDependency = {
  from: string;
  package: string;
  imports: string[];
};

/*
|--------------------------------------------------------------------------
| Graph Node
|--------------------------------------------------------------------------
|
| This is the representation the frontend will eventually consume.
|--------------------------------------------------------------------------
*/

export type DependencyNode = {
  id: string;

  name: string;

  path: string;

  language: ParsedFile["language"];

  functions: ParsedFile["functions"];

  classes: ParsedFile["classes"];

  components: ParsedFile["components"];

  imports: ParsedFile["imports"];

  exports: ParsedFile["exports"];

  /*
  | Files this file imports.
  */

  dependencies: string[];

  /*
  | Files that import this file.
  */

  dependents: string[];
};

/*
|--------------------------------------------------------------------------
| Complete Dependency Graph
|--------------------------------------------------------------------------
*/

export type DependencyGraph = {
  nodes: DependencyNode[];

  edges: DependencyEdge[];

  externalDependencies: ExternalDependency[];
};

/*
|--------------------------------------------------------------------------
| Resolve an import to an actual repository file
|--------------------------------------------------------------------------
*/

function resolveImport(
  importerPath: string,
  importSource: string,
  repositoryFiles: Map<string, ParsedFile>,
): string | null {
  /*
  |--------------------------------------------------------------------------
  | External packages
  |--------------------------------------------------------------------------
  */

  if (!importSource.startsWith(".") && !importSource.startsWith("@/")) {
    return null;
  }

  const normalizedImporter = importerPath.replace(/\\/g, "/");

  const importerDirectory = path.posix.dirname(normalizedImporter);

  let resolvedPath: string;

  /*
  |--------------------------------------------------------------------------
  | Relative import
  |--------------------------------------------------------------------------
  |
  | ./Navbar
  | ../utils/auth
  |--------------------------------------------------------------------------
  */

  if (importSource.startsWith(".")) {
    resolvedPath = path.posix.normalize(
      path.posix.join(importerDirectory, importSource),
    );
  } else if (importSource.startsWith("@/")) {
    /*
  |--------------------------------------------------------------------------
  | @/ alias
  |--------------------------------------------------------------------------
  |
  | @/components/Navbar
  |
  | Currently assumes:
  |
  | @/ → src/
  |--------------------------------------------------------------------------
  */
    const withoutAlias = importSource.slice(2);

    resolvedPath = path.posix.normalize(path.posix.join("src", withoutAlias));
  } else {
    return null;
  }

  resolvedPath = resolvedPath.replace(/^\.\//, "");

  /*
  |--------------------------------------------------------------------------
  | Exact file
  |--------------------------------------------------------------------------
  */

  if (repositoryFiles.has(resolvedPath)) {
    return resolvedPath;
  }

  /*
  |--------------------------------------------------------------------------
  | Try extensions
  |--------------------------------------------------------------------------
  */

  for (const extension of SUPPORTED_EXTENSIONS) {
    const candidate = `${resolvedPath}${extension}`;

    if (repositoryFiles.has(candidate)) {
      return candidate;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Try index files
  |--------------------------------------------------------------------------
  */

  for (const extension of SUPPORTED_EXTENSIONS) {
    const candidate = `${resolvedPath}/index${extension}`;

    if (repositoryFiles.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Extract external package name
|--------------------------------------------------------------------------
*/

function getPackageName(importSource: string): string {
  /*
  | Scoped package
  |
  | @google/generative-ai
  |
  | @tanstack/react-query
  */

  if (importSource.startsWith("@")) {
    const parts = importSource.split("/");

    return parts.slice(0, 2).join("/");
  }

  /*
  | Regular package
  |
  | react
  | react-router-dom
  */

  return importSource.split("/")[0];
}

/*
|--------------------------------------------------------------------------
| Build Dependency Graph
|--------------------------------------------------------------------------
*/

export function buildDependencyGraph(files: ParsedFile[]): DependencyGraph {
  /*
  |--------------------------------------------------------------------------
  | Map file path → ParsedFile
  |--------------------------------------------------------------------------
  */

  const repositoryFiles = new Map<string, ParsedFile>();

  for (const file of files) {
    repositoryFiles.set(file.path.replace(/\\/g, "/"), file);
  }

  /*
  |--------------------------------------------------------------------------
  | Build basic edges
  |--------------------------------------------------------------------------
  */

  const edges: DependencyEdge[] = [];

  const externalDependencies: ExternalDependency[] = [];

  for (const file of files) {
    for (const importInfo of file.imports) {
      const source = importInfo.source;

      /*
      |--------------------------------------------------------------------------
      | Try to resolve internal dependency
      |--------------------------------------------------------------------------
      */

      const resolved = resolveImport(file.path, source, repositoryFiles);

      if (resolved) {
        edges.push({
          from: file.path,
          to: resolved,
          imports: importInfo.names,
        });

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | Otherwise treat it as external.
      |--------------------------------------------------------------------------
      */

      if (!source.startsWith(".") && !source.startsWith("@/")) {
        externalDependencies.push({
          from: file.path,
          package: getPackageName(source),
          imports: importInfo.names,
        });
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Build nodes
  |--------------------------------------------------------------------------
  */

  const nodes: DependencyNode[] = files.map((file) => {
    /*
      | Files this file depends on.
      */

    const dependencies = [
      ...new Set(
        edges.filter((edge) => edge.from === file.path).map((edge) => edge.to),
      ),
    ];

        /*
            | Files that depend on this file.
        */

    const dependents = [
      ...new Set(
        edges.filter((edge) => edge.to === file.path).map((edge) => edge.from),
      ),
    ];

    return {
      id: file.path,

      name: file.name,

      path: file.path,

      language: file.language,

      functions: file.functions,

      classes: file.classes,

      components: file.components,

      imports: file.imports,

      exports: file.exports,

      dependencies,

      dependents,
    };
  });

  return {
    nodes,

    edges,

    externalDependencies,
  };
}
