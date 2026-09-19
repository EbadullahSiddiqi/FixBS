"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { getUserRepositories } from "../actions/github";
import { analyzeRepositoryWithAI } from "../actions/analysis";
import { getClerkGitHubAccessToken } from "../actions/auth";

import DependencyGraph from "@/components/dashboard/DependencyGraph";
import FileInspector from "@/components/dashboard/FileInspector";
import AIAnalysis, { type AIAnalysisData, getHealthStatus } from "@/components/dashboard/AIAnalysis";
import ProgressiveLoader from "@/components/dashboard/ProgressiveLoader";
import EmptyWorkspace from "@/components/dashboard/EmptyWorkspace";

import {
  Code2,
  GitBranch,
  Github,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Lock,
  Globe,
  FileCode2,
  ArrowLeft,
  ChevronDown,
  Layers,
  AlertTriangle,
  Key,
} from "lucide-react";

type RepositoryOption = {
  id: number | string | bigint;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description?: string | null;
};

type GraphNode = {
  id: string;
  name: string;
  path: string;
  language: string;
  functions: { name: string; line: number }[];
  classes: { name: string; line: number }[];
  components: { name: string; line: number }[];
  imports: { source: string; names: string[] }[];
  exports: { name: string; type: string }[];
  dependencies: string[];
  dependents: string[];
};

type DependencyGraphData = {
  nodes: GraphNode[];
  edges: any[];
  externalDependencies?: any[];
};

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [patInput, setPatInput] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const [repos, setRepos] = useState<RepositoryOption[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedRepoMeta, setSelectedRepoMeta] = useState<RepositoryOption | null>(null);

  const [graph, setGraph] = useState<DependencyGraphData | null>(null);
  const [selectedFile, setSelectedFile] = useState<GraphNode | null>(null);
  const [targetLine, setTargetLine] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);

  const [loading, setLoading] = useState(false);
  const [repoLoading, setRepoLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [rightPanel, setRightPanel] = useState<"ai" | "file">("ai");

  /*
  | Fetch GitHub OAuth access token from Clerk on mount or session change
  */
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setRepoLoading(false);
      return;
    }

    async function loadTokenAndRepos() {
      setRepoLoading(true);
      setError("");

      try {
        // Try getting OAuth token from Clerk
        let token = await getClerkGitHubAccessToken();

        // Fall back to saved PAT if present in localStorage
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("fixbs_github_pat");
        }

        if (!token) {
          setShowTokenInput(true);
          setRepoLoading(false);
          return;
        }

        setAccessToken(token);
        const data = await getUserRepositories(token);
        setRepos(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user repositories from GitHub.");
        setShowTokenInput(true);
      } finally {
        setRepoLoading(false);
      }
    }

    loadTokenAndRepos();
  }, [isLoaded, isSignedIn]);

  /*
  | Save manual GitHub PAT fallback
  */
  function handleSavePat(e: React.FormEvent) {
    e.preventDefault();
    if (!patInput.trim()) return;

    const token = patInput.trim();
    if (typeof window !== "undefined") {
      localStorage.setItem("fixbs_github_pat", token);
    }
    setAccessToken(token);
    setShowTokenInput(false);
    setRepoLoading(true);

    getUserRepositories(token)
      .then((data) => setRepos(data))
      .catch((err) => {
        console.error(err);
        setError("Invalid GitHub token. Please verify permissions.");
      })
      .finally(() => setRepoLoading(false));
  }

  /*
  | Ingest & Analyze Selected Repository
  */
  async function handleSelectRepo(fullName: string) {
    if (!fullName) return;

    const repoItem = repos.find((r) => r.fullName === fullName) || null;
    setSelectedRepo(fullName);
    setSelectedRepoMeta(repoItem);
    setSelectedFile(null);
    setTargetLine(null);
    setGraph(null);
    setAnalysis(null);
    setError("");
    setRightPanel("ai");
    setLoading(true);

    try {
      const activeToken = accessToken || patInput.trim();
      if (!activeToken) {
        throw new Error("No GitHub access token available.");
      }

      const [owner, repo] = fullName.split("/");
      const result = await analyzeRepositoryWithAI(activeToken, owner, repo);

      setGraph(result.repository.dependencyGraph);
      setAnalysis(result.analysis as AIAnalysisData);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to analyze repository.");
    } finally {
      setLoading(false);
    }
  }

  /*
  | Interactive Evidence Navigation (Finding -> File Inspector)
  */
  function handleSelectFileLocation(filePath: string, line: number) {
    if (!graph) return;

    // Find node matching the file path (exact or relative basename match)
    const normalizedTarget = filePath.toLowerCase().replace(/\\/g, "/");
    const matchedNode = graph.nodes.find((node) => {
      const nodePath = node.path.toLowerCase().replace(/\\/g, "/");
      return nodePath.endsWith(normalizedTarget) || normalizedTarget.endsWith(nodePath);
    });

    if (matchedNode) {
      setSelectedFile(matchedNode);
    } else {
      // Fallback node if exact match not parsed in AST graph
      setSelectedFile({
        id: filePath,
        name: filePath.split("/").pop() || filePath,
        path: filePath,
        language: filePath.endsWith(".tsx") || filePath.endsWith(".ts") ? "TypeScript font" : "JavaScript",
        functions: [{ name: "targetScope", line }],
        classes: [],
        components: [],
        imports: [],
        exports: [],
        dependencies: [],
        dependents: [],
      });
    }

    setTargetLine(line);
    setRightPanel("file");
  }

  /*
  | Sidebar Client-Side Search Filter
  */
  const filteredNodes = useMemo(() => {
    if (!graph) return [];
    if (!searchQuery.trim()) return graph.nodes;

    const query = searchQuery.toLowerCase();
    return graph.nodes.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        node.path.toLowerCase().includes(query)
    );
  }, [graph, searchQuery]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1c1b1b] text-white">
        <Loader2 className="h-7 w-7 animate-spin text-[#ffeca0]" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1c1b1b] text-white p-4">
        <div className="text-center max-w-sm rounded-2xl border border-white/10 bg-[#151414] p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffeca0]/10 border border-[#ffeca0]/20">
            <GitBranch className="h-6 w-6 text-[#ffeca0]" />
          </div>
          <h2 className="text-lg font-bold text-white">FixBS Workspace</h2>
          <p className="mt-2 text-xs text-white/40 leading-relaxed">
            Please sign in with Clerk to access repository AST analysis and dependency graphing.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ffeca0] px-5 py-2.5 text-xs font-semibold text-[#1c1b1b] transition hover:bg-[#ffeca0]/90"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#1c1b1b] text-white selection:bg-[#ffeca0]/20 selection:text-[#ffeca0]">
      {/* Level 1 Header — Repository Identity & Controls */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#1c1b1b] px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 transition opacity-90 hover:opacity-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffeca0] text-[#1c1b1b] shadow-md shadow-[#ffeca0]/10">
              <GitBranch className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">FixBS</h1>
              <p className="text-[9px] font-mono text-white/30">Code Intelligence</p>
            </div>
          </Link>

          {/* Active Repository Identity Metadata Pill */}
          {selectedRepo && (
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs">
              <Github className="h-3.5 w-3.5 text-white/40" />
              <span className="font-semibold text-white font-mono">{selectedRepo}</span>
              {selectedRepoMeta?.private ? (
                <span className="flex items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-300">
                  <Lock className="h-2.5 w-2.5" /> Private
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-white/40">
                  <Globe className="h-2.5 w-2.5" /> Public
                </span>
              )}

              {graph && (
                <span className="text-[10px] font-mono text-[#ffeca0] border-l border-white/10 pl-2">
                  {graph.nodes.length} files · {graph.edges.length} deps
                </span>
              )}
            </div>
          )}
        </div>

        {/* Repository Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedRepo}
              onChange={(e) => handleSelectRepo(e.target.value)}
              disabled={repoLoading || loading}
              className="h-9 min-w-[260px] sm:min-w-[300px] appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 pr-9 text-xs font-mono text-white outline-none transition focus:border-[#ffeca0]/40 disabled:opacity-50 cursor-pointer"
            >
              <option value="" className="bg-[#1c1b1b]">
                {repoLoading ? "Loading repositories..." : "Select GitHub Repository"}
              </option>

              {repos.map((repo) => (
                <option key={repo.id} value={repo.fullName} className="bg-[#1c1b1b]">
                  {repo.fullName} {repo.private ? "(Private)" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* GitHub Personal Access Token Fallback Modal Trigger */}
          <button
            onClick={() => setShowTokenInput(!showTokenInput)}
            title="Configure GitHub Personal Access Token"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Key className="h-4 w-4" />
          </button>

          {/* User Profile */}
          <div className="pl-2 border-l border-white/10 flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-xs font-semibold text-white/80">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-[9px] font-mono text-[#ffeca0]">GitHub Connected</p>
            </div>
            <UserButton />
          </div>
        </div>
      </header>

      {/* GitHub Personal Access Token Configuration Modal/Banner */}
      {showTokenInput && (
        <div className="border-b border-amber-400/20 bg-amber-400/5 px-6 py-3">
          <form onSubmit={handleSavePat} className="mx-auto flex max-w-4xl items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <Key className="h-4 w-4 shrink-0" />
              <span>Provide GitHub Personal Access Token if repo scope is restricted:</span>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                className="h-8 flex-1 rounded-lg border border-amber-400/30 bg-[#1c1b1b] px-3 font-mono text-xs text-white outline-none focus:border-[#ffeca0]"
              />
              <button
                type="submit"
                className="h-8 rounded-lg bg-[#ffeca0] px-3 font-semibold text-[#1c1b1b] transition hover:bg-[#ffeca0]/90"
              >
                Save Token
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left Sidebar — Repository File Tree Search */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#191818] lg:flex lg:flex-col">
          {/* File Search Input */}
          <div className="border-b border-white/10 p-3.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="h-8 w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/20 focus:border-[#ffeca0]/30 font-mono"
              />
            </div>
          </div>

          {/* File Tree List */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
              <span>Repository Files</span>
              {graph && <span>{filteredNodes.length}</span>}
            </div>

            {!graph ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-7 animate-pulse rounded-lg bg-white/[0.03]" />
                ))}
              </div>
            ) : filteredNodes.length === 0 ? (
              <p className="mt-4 text-center text-xs text-white/30 italic">No matching files found.</p>
            ) : (
              <div className="space-y-1">
                {filteredNodes.map((node) => {
                  const isSelected = selectedFile?.id === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        setSelectedFile(node);
                        setTargetLine(null);
                        setRightPanel("file");
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition font-mono text-xs ${
                        isSelected
                          ? "bg-[#ffeca0]/15 text-[#ffeca0] border border-[#ffeca0]/30"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate max-w-[170px]">{node.name}</span>
                      <span className="text-[9px] text-white/25">
                        {node.functions.length > 0 ? `${node.functions.length}fn` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Footer Stats */}
          {graph && (
            <div className="border-t border-white/10 p-3 bg-[#151414]">
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="rounded-lg bg-white/[0.025] p-2 border border-white/5">
                  <p className="text-[8px] uppercase tracking-wider text-white/30">Parsed Nodes</p>
                  <p className="mt-0.5 text-xs font-bold text-white/80">{graph.nodes.length}</p>
                </div>
                <div className="rounded-lg bg-white/[0.025] p-2 border border-white/5">
                  <p className="text-[8px] uppercase tracking-wider text-white/30">Graph Edges</p>
                  <p className="mt-0.5 text-xs font-bold text-[#ffeca0]">{graph.edges.length}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center Workspace Canvas */}
        <section className="min-w-0 flex-1 p-4 bg-[#1c1b1b]">
          {loading ? (
            <ProgressiveLoader repoName={selectedRepo} />
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-[#151414] p-8 text-center">
              <AlertTriangle className="mb-4 h-8 w-8 text-red-400" />
              <h3 className="text-sm font-semibold text-red-300">Analysis Failed</h3>
              <p className="mt-2 text-xs text-white/40 max-w-sm leading-relaxed">{error}</p>
              <button
                onClick={() => selectedRepo && handleSelectRepo(selectedRepo)}
                className="mt-6 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Analysis Again</span>
              </button>
            </div>
          ) : graph ? (
            <DependencyGraph
              graph={graph}
              onSelectFile={(fileNode) => {
                setSelectedFile(fileNode);
                setTargetLine(null);
                setRightPanel("file");
              }}
            />
          ) : (
            <EmptyWorkspace onFocusRepoSelect={() => {
              const selectEl = document.querySelector("select");
              if (selectEl) selectEl.focus();
            }} />
          )}
        </section>

        {/* Right Inspection & AI Panel */}
        <div className="hidden w-[380px] shrink-0 xl:flex xl:flex-col bg-[#191818]">
          {/* Panel Toggle Tabs */}
          <div className="flex h-12 shrink-0 border-l border-b border-white/10 bg-[#191818]">
            <button
              onClick={() => setRightPanel("ai")}
              className={`flex flex-1 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition ${
                rightPanel === "ai"
                  ? "border-b-2 border-[#ffeca0] text-[#ffeca0] bg-white/[0.02]"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Analysis
            </button>

            <button
              onClick={() => setRightPanel("file")}
              className={`flex flex-1 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition ${
                rightPanel === "file"
                  ? "border-b-2 border-[#ffeca0] text-[#ffeca0] bg-white/[0.02]"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              File Inspector {selectedFile ? `(${selectedFile.name})` : ""}
            </button>
          </div>

          {/* Active Panel View */}
          <div className="min-h-0 flex-1">
            {rightPanel === "ai" ? (
              <AIAnalysis
                analysis={analysis}
                onSelectFileLocation={handleSelectFileLocation}
              />
            ) : (
              <FileInspector file={selectedFile} targetLine={targetLine} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
