"use client";

import { GitBranch, Workflow, Sparkles, ShieldCheck, Code2, ArrowRight } from "lucide-react";

type Props = {
  onFocusRepoSelect?: () => void;
};

export default function EmptyWorkspace({ onFocusRepoSelect }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#151414] p-8 text-center">
      {/* Onboarding Header */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-mono text-[#ffeca0]">
        <GitBranch className="h-3.5 w-3.5" />
        <span>SELECT REPOSITORY TO BEGIN ANALYSIS</span>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
        Understand your codebase
      </h2>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-white/40">
        Select any GitHub repository from the top header to trigger AST file parsing, dependency graph construction, and Gemini AI health diagnostics.
      </p>

      {/* Technical Pipeline Visualization */}
      <div className="my-8 grid grid-cols-1 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
        <div className="rounded-xl border border-white/5 bg-[#191818] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[#ffeca0] text-[10px] font-mono uppercase font-semibold">
            <GitBranch className="h-3 w-3" />
            <span>01. Ingestion</span>
          </div>
          <p className="text-xs font-semibold text-white/80">GitHub Tree</p>
          <p className="text-[10px] text-white/30">Fetches repo JS/TS tree</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#191818] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[#ffeca0] text-[10px] font-mono uppercase font-semibold">
            <Code2 className="h-3 w-3" />
            <span>02. Parser</span>
          </div>
          <p className="text-xs font-semibold text-white/80">AST Resolution</p>
          <p className="text-[10px] text-white/30">Extracts imports & exports</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#191818] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[#ffeca0] text-[10px] font-mono uppercase font-semibold">
            <Workflow className="h-3 w-3" />
            <span>03. Graph</span>
          </div>
          <p className="text-xs font-semibold text-white/80">Dependency Canvas</p>
          <p className="text-[10px] text-white/30">Builds interactive graph</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#191818] p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[#ffeca0] text-[10px] font-mono uppercase font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>04. AI Diagnostic</span>
          </div>
          <p className="text-xs font-semibold text-white/80">Health Rating</p>
          <p className="text-[10px] text-white/30">Generates findings & line evidence</p>
        </div>
      </div>

      {/* Primary Action Button */}
      {onFocusRepoSelect && (
        <button
          onClick={onFocusRepoSelect}
          className="flex items-center gap-2 rounded-xl bg-[#ffeca0] px-5 py-2.5 text-xs font-semibold text-[#1c1b1b] transition hover:bg-[#ffeca0]/90 hover:scale-[1.02]"
        >
          <span>Select Repository from Menu</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
