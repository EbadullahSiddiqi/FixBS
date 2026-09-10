"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { getUserRepositories } from "../actions/github";
import { analyzeRepositoryWithAI } from "../actions/analysis";

import DependencyGraph from "@/components/dashboard/DependencyGraph";
import FileInspector from "@/components/dashboard/FileInspector";
import AIAnalysis from "@/components/dashboard/AIAnalysis";

import {
  Code2,
  GitBranch,
  Github,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

type Repository = {
  id: number | string;
  fullName: string;
};

type GraphNode = {
  id: string;
  path: string;
  [key: string]: unknown;
};

type DependencyGraphData = {
  nodes: GraphNode[];
  edges: unknown[];
  [key: string]: unknown;
};

type SelectedFile = GraphNode | null;

type Analysis = unknown;

export default function Dashboard() {
  const { data: session } = useSession();

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [graph, setGraph] = useState<DependencyGraphData | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>(null);
  const [analysis, setAnalysis] = useState<Analysis>(null);

  const [loading, setLoading] = useState(false);
  const [repoLoading, setRepoLoading] = useState(true);
  const [error, setError] = useState("");

  const [rightPanel, setRightPanel] = useState<"ai" | "file">("ai");

  useEffect(() => {
    if (!session?.accessToken) {
      setRepoLoading(false);
      return;
    }

    setRepoLoading(true);

    getUserRepositories(session.accessToken)
      .then((data) => {
        setRepos(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load repositories.");
      })
      .finally(() => {
        setRepoLoading(false);
      });
  }, [session?.accessToken]);

  async function handleSelectRepo(fullName: string) {
    if (!session?.accessToken || !fullName) return;

    setSelectedRepo(fullName);
    setSelectedFile(null);
    setGraph(null);
    setAnalysis(null);
    setError("");
    setRightPanel("ai");
    setLoading(true);

    try {
      const [owner, repo] = fullName.split("/");

      const result = await analyzeRepositoryWithAI(
        session.accessToken,
        owner,
        repo,
      );

      setGraph(result.repository.dependencyGraph);
      setAnalysis(result.analysis);

      console.log("Gemini analysis:", result.analysis);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze repository.");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1c1b1b] text-white">
        <div className="text-center">
          <Github className="mx-auto mb-4 h-8 w-8 text-white/30" />

          <p className="text-sm text-white/50">Please sign in with GitHub.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#1c1b1b] text-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffeca0]">
            <GitBranch className="h-4 w-4 text-[#1c1b1b]" />
          </div>

          <div>
            <h1 className="text-sm font-semibold">FixBS</h1>

            <p className="text-[10px] text-white/30">Code intelligence</p>
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedRepo}
            onChange={(event) => handleSelectRepo(event.target.value)}
            disabled={repoLoading || loading}
            className="h-9 min-w-[280px] appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-3 pr-9 text-xs text-white outline-none transition focus:border-[#ffeca0]/40 disabled:opacity-50"
          >
            <option value="" className="bg-[#1c1b1b]">
              Select repository
            </option>

            {repos.map((repo) => (
              <option
                key={repo.id}
                value={repo.fullName}
                className="bg-[#1c1b1b]"
              >
                {repo.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-white/70">
              {session.user?.name || session.user?.email}
            </p>

            <p className="text-[10px] text-white/30">GitHub connected</p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Github className="h-4 w-4 text-white/60" />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#191818] lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />

              <input
                placeholder="Search files..."
                className="h-9 w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/20 focus:border-[#ffeca0]/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
              Repository
            </p>

            {!graph ? (
              <div className="space-y-2">
                {["src", "components", "config"].map((item) => (
                  <div
                    key={item}
                    className="h-7 animate-pulse rounded bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {graph.nodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedFile(node);
                      setRightPanel("file");
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                      selectedFile?.id === node.id
                        ? "bg-[#ffeca0]/10 text-[#ffeca0]"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    <span className="text-[10px]">◇</span>

                    <span className="truncate text-xs">{node.path}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {graph && (
            <div className="border-t border-white/10 p-4">
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="Files" value={graph.nodes.length} />

                <MiniStat label="Links" value={graph.edges.length} />
              </div>
            </div>
          )}
        </aside>

        <section className="min-w-0 flex-1 p-4">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#151414]">
              <Loader2 className="mb-4 h-7 w-7 animate-spin text-[#ffeca0]" />

              <p className="text-sm text-white/70">Analyzing repository</p>

              <p className="mt-1 text-xs text-white/30">
                Building AST, dependency graph, and AI analysis...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-red-500/10 bg-[#151414]">
              <p className="text-sm text-red-300">{error}</p>

              <button
                onClick={() => selectedRepo && handleSelectRepo(selectedRepo)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : graph ? (
            <DependencyGraph
              graph={graph}
              onSelectFile={(file: GraphNode) => {
                setSelectedFile(file);
                setRightPanel("file");
              }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#151414]">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffeca0]/5">
                <GitBranch className="h-6 w-6 text-[#ffeca0]/50" />
              </div>

              <h2 className="text-sm font-medium text-white/70">
                Select a repository
              </h2>

              <p className="mt-1 max-w-sm text-center text-xs leading-5 text-white/30">
                FixBS will analyze its TypeScript and JavaScript files and build
                an interactive dependency graph.
              </p>
            </div>
          )}
        </section>

        <div className="hidden w-[360px] shrink-0 xl:flex xl:flex-col">
          <div className="flex h-12 shrink-0 border-l border-b border-white/10 bg-[#191818]">
            <button
              onClick={() => setRightPanel("ai")}
              className={`flex flex-1 items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-wider transition ${
                rightPanel === "ai"
                  ? "border-b border-[#ffeca0] text-[#ffeca0]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Analysis
            </button>

            <button
              onClick={() => setRightPanel("file")}
              className={`flex flex-1 items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-wider transition ${
                rightPanel === "file"
                  ? "border-b border-[#ffeca0] text-[#ffeca0]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              File
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {rightPanel === "ai" ? (
              <AIAnalysis analysis={analysis} />
            ) : (
              <FileInspector file={selectedFile} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/[0.03] p-2.5">
      <p className="text-[9px] uppercase tracking-wider text-white/25">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-white/60">{value}</p>
    </div>
  );
}
