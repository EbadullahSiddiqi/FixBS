"use client";

import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import Navbar from "./Navbar";
import {
  GitBranch,
  Github,
  Sparkles,
  Code2,
  ArrowRight,
  Workflow,
  Activity,
  FileCode2,
  Cpu,
} from "lucide-react";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#1c1b1b] text-white selection:bg-[#ffeca0]/20 selection:text-[#ffeca0]">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-white/5">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#ffeca0]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70 mb-6 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#ffeca0]" />
              <span>AI-Powered Repository AST Intelligence</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span className="text-[#ffeca0] font-medium">JS & TS Support</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              Understand your entire codebase in{" "}
              <span className="text-[#ffeca0] underline decoration-[#ffeca0]/30 underline-offset-8">
                seconds.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
              FixBS ingests your GitHub repositories, parses JavaScript & TypeScript ASTs, constructs interactive architectural dependency graphs, and delivers structured AI health findings with line-level evidence.
            </p>

            {/* Call to Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {!isLoaded ? (
                <div className="h-12 w-44 animate-pulse rounded-xl bg-white/5" />
              ) : isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-[#ffeca0] px-6 py-3.5 text-sm font-semibold text-[#1c1b1b] shadow-xl shadow-[#ffeca0]/10 transition hover:bg-[#ffeca0]/90 hover:scale-[1.02]"
                >
                  <GitBranch className="h-4 w-4" />
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-2 rounded-xl bg-[#ffeca0] px-6 py-3.5 text-sm font-semibold text-[#1c1b1b] shadow-xl shadow-[#ffeca0]/10 transition hover:bg-[#ffeca0]/90 hover:scale-[1.02]">
                      <Github className="h-4 w-4" />
                      <span>Analyze Repository Free</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </SignUpButton>

                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/10 hover:border-white/20">
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                </>
              )}
            </div>

            {/* Key Metrics Strip */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/5 text-left max-w-3xl mx-auto">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-white/30">Parser</p>
                <p className="mt-1 text-sm font-semibold text-white/80">AST Module Resolution</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-white/30">Graph Engine</p>
                <p className="mt-1 text-sm font-semibold text-[#ffeca0]">Interactive ReactFlow</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-white/30">AI Model</p>
                <p className="mt-1 text-sm font-semibold text-white/80">Google Gemini 2.5</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-white/30">Integrations</p>
                <p className="mt-1 text-sm font-semibold text-white/80">GitHub REST & OAuth</p>
              </div>
            </div>
          </div>

          {/* Interactive Workspace Mockup Preview */}
          <div className="mt-14 relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-white/10 bg-[#151414] p-3 shadow-2xl shadow-black/80">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#1c1b1b] rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs font-mono text-white/40">github.com/automoto/auto-qr</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-[#ffeca0]/10 px-2 py-0.5 text-[10px] font-mono text-[#ffeca0]">
                    TypeScript · 47 files · 83 dependencies
                  </span>
                </div>
              </div>

              {/* Workspace Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-[#151414]">
                {/* Left Sidebar */}
                <div className="md:col-span-3 rounded-xl border border-white/5 bg-[#191818] p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">
                    <span>Repository Files</span>
                    <span>47</span>
                  </div>
                  {["app/dashboard/page.tsx", "components/FileUpload.jsx", "lib/ast/parser.ts", "lib/ai/analyze.ts"].map((file, idx) => (
                    <div
                      key={file}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition ${
                        idx === 1 ? "bg-[#ffeca0]/10 text-[#ffeca0] border border-[#ffeca0]/20" : "text-white/50 hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{file}</span>
                      {idx === 1 && <span className="h-1.5 w-1.5 rounded-full bg-[#ffeca0]" />}
                    </div>
                  ))}
                </div>

                {/* Main Architecture Graph Canvas */}
                <div className="md:col-span-6 rounded-xl border border-white/5 bg-[#171616] p-4 flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-white/30">Architecture Dependency Graph</span>
                    <span className="text-[10px] text-[#ffeca0]">Live AST Nodes</span>
                  </div>

                  {/* Graph Node Visualization */}
                  <div className="relative h-40 flex items-center justify-center my-2">
                    <div className="absolute left-6 top-6 p-2.5 rounded-xl border border-[#ffeca0]/30 bg-[#1c1b1b] shadow-lg text-left">
                      <p className="text-[10px] font-mono text-[#ffeca0]">FileUpload.jsx</p>
                      <p className="text-[9px] text-white/40">2 functions · 1 export</p>
                    </div>

                    <svg className="absolute inset-0 h-full w-full pointer-events-none">
                      <line x1="120" y1="50" x2="220" y2="100" stroke="rgba(255, 236, 160, 0.4)" strokeWidth="1.5" strokeDasharray="4 2" />
                      <line x1="220" y1="100" x2="320" y2="60" stroke="rgba(255, 236, 160, 0.4)" strokeWidth="1.5" />
                    </svg>

                    <div className="p-2.5 rounded-xl border border-white/10 bg-[#1c1b1b] shadow-lg text-left">
                      <p className="text-[10px] font-mono text-white/80">page.tsx</p>
                      <p className="text-[9px] text-white/40">Component Root</p>
                    </div>

                    <div className="absolute right-6 bottom-6 p-2.5 rounded-xl border border-white/10 bg-[#1c1b1b] shadow-lg text-left">
                      <p className="text-[10px] font-mono text-white/80">api/github.ts</p>
                      <p className="text-[9px] text-white/40">REST Client</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-white/30 pt-2 border-t border-white/5">
                    <span>47 files mapped</span>
                    <span>83 import edges</span>
                  </div>
                </div>

                {/* Right AI Findings Panel */}
                <div className="md:col-span-3 rounded-xl border border-white/5 bg-[#191818] p-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-white/30">AI Code Health</span>
                    <span className="text-xs font-semibold text-[#ffeca0]">6.0 / 10</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-orange-400/20 bg-orange-400/5 space-y-1 text-left">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-orange-300">
                      <span className="uppercase">Major · Bug</span>
                      <span>Line 53</span>
                    </div>
                    <p className="text-xs font-medium text-white/80 truncate">Hardcoded localhost URL</p>
                    <p className="text-[10px] text-white/40 line-clamp-2">Client-side requests will fail in production build.</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-yellow-300/20 bg-yellow-300/5 space-y-1 text-left">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-yellow-200">
                      <span className="uppercase">Minor · Quality</span>
                      <span>Line 12</span>
                    </div>
                    <p className="text-xs font-medium text-white/80 truncate">Unused export `verifyToken`</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How FixBS Works - Pipeline */}
      <section id="how-it-works" className="py-20 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#ffeca0]">System Architecture</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From raw code to precise intelligence.
            </p>
            <p className="mt-4 text-sm text-white/40">
              FixBS executes five distinct automated stages every time a repository is selected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "GitHub Ingestion",
                desc: "Fetches complete git tree, filters JS/TS files, and downloads blobs concurrently.",
                icon: Github,
              },
              {
                step: "02",
                title: "AST Tree Parsing",
                desc: "Parses Babel ASTs to extract functions, components, imports, and exports.",
                icon: FileCode2,
              },
              {
                step: "03",
                title: "Dependency Graph",
                desc: "Resolves internal module imports and constructs an interactive ReactFlow node graph.",
                icon: Workflow,
              },
              {
                step: "04",
                title: "Gemini Reasoning",
                desc: "Passes rich structural code context to Google Gemini for structured security & bug analysis.",
                icon: Cpu,
              },
              {
                step: "05",
                title: "Evidence Diagnostics",
                desc: "Presents health score, scannable findings, and direct file/line navigation.",
                icon: Activity,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-[#ffeca0]">{item.step}</span>
                  <item.icon className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-b border-white/5 bg-[#191818]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#ffeca0]">Capabilities</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for developer clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/5 bg-[#151414] p-6 hover:border-white/10 transition">
              <div className="h-10 w-10 rounded-xl bg-[#ffeca0]/10 flex items-center justify-center mb-4">
                <Workflow className="h-5 w-5 text-[#ffeca0]" />
              </div>
              <h3 className="text-base font-semibold text-white">Interactive Dependency Graph</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/40">
                Visualize how files import each other across your entire codebase. Click any node to inspect exports, functions, and dependents.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#151414] p-6 hover:border-white/10 transition">
              <div className="h-10 w-10 rounded-xl bg-[#ffeca0]/10 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-[#ffeca0]" />
              </div>
              <h3 className="text-base font-semibold text-white">Structured AI Health Score</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/40">
                Get an instant numerical rating (0-10) with clear qualitative statuses (Healthy, Good, Needs Attention, Critical) based on objective code findings.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#151414] p-6 hover:border-white/10 transition">
              <div className="h-10 w-10 rounded-xl bg-[#ffeca0]/10 flex items-center justify-center mb-4">
                <Code2 className="h-5 w-5 text-[#ffeca0]" />
              </div>
              <h3 className="text-base font-semibold text-white">Evidence-Based Navigation</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/40">
                Every AI finding points directly to the target file and line number. One click jumps straight into the file inspector for rapid verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#151414]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#ffeca0] flex items-center justify-center text-[#1c1b1b]">
              <GitBranch className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-white">FixBS</span>
            <span className="text-xs text-white/30">— AST & AI Code Intelligence</span>
          </div>

          <p className="text-xs text-white/30">
            Created by Ebadullah Siddique
          </p>
        </div>
      </footer>
    </div>
  );
}
