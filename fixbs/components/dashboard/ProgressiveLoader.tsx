"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, GitBranch, Sparkles, FileCode2, Cpu, Network } from "lucide-react";

type Props = {
  repoName: string;
};

const STEPS = [
  { id: "connect", label: "Repository connected", icon: GitBranch },
  { id: "files", label: "Files & tree structure discovered", icon: FileCode2 },
  { id: "ast", label: "AST syntax analysis complete", icon: Cpu },
  { id: "graph", label: "Dependency graph resolved", icon: Network },
  { id: "ai", label: "Gemini AI code reasoning in progress", icon: Sparkles },
];

export default function ProgressiveLoader({ repoName }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 600);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 1400);
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 2200);
    const timer4 = setTimeout(() => setCurrentStepIndex(4), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [repoName]);

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#151414] p-8 text-center">
      {/* Central Pulsing Icon */}
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ffeca0]/20 bg-[#ffeca0]/5 shadow-xl shadow-[#ffeca0]/5">
          <Sparkles className="h-7 w-7 text-[#ffeca0] animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1c1b1b] border border-white/10">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ffeca0]" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-base font-bold text-white tracking-tight">
        Analyzing <span className="font-mono text-[#ffeca0]">{repoName}</span>
      </h2>
      <p className="mt-1 text-xs text-white/40 max-w-sm">
        Executing full AST parsing, dependency graph resolution, and AI health diagnostic...
      </p>

      {/* Progressive Steps List */}
      <div className="mt-8 w-full max-w-md space-y-2.5 rounded-xl border border-white/5 bg-[#191818] p-4 text-left">
        {STEPS.map((step, index) => {
          const isDone = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all duration-300 ${
                isDone
                  ? "bg-white/[0.03] text-white/80"
                  : isCurrent
                  ? "bg-[#ffeca0]/10 border border-[#ffeca0]/20 text-[#ffeca0]"
                  : "text-white/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <StepIcon className={`h-3.5 w-3.5 ${isCurrent ? "text-[#ffeca0]" : isDone ? "text-emerald-400" : "text-white/20"}`} />
                <span className="font-medium">{step.label}</span>
              </div>

              <div>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ffeca0]" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/10 inline-block" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
