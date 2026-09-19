"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Info,
  LockKeyhole,
  Sparkles,
  TriangleAlert,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";

export type FindingSeverity = "critical" | "major" | "minor" | "info";

export type FindingCategory = "architecture" | "bug" | "security" | "quality";

export type AIFinding = {
  id: string;
  severity: FindingSeverity;
  category: FindingCategory;
  file: string;
  line: number;
  title: string;
  explanation: string;
  recommendation: string;
};

export type AIAnalysisData = {
  score: number;
  summary: string;
  findings: AIFinding[];
};

type Filter = "all" | FindingCategory;

type Props = {
  analysis: AIAnalysisData | null;
  onSelectFileLocation?: (file: string, line: number) => void;
};

const severityConfig: Record<
  FindingSeverity,
  {
    label: string;
    className: string;
    icon: typeof AlertCircle;
  }
> = {
  critical: {
    label: "Critical",
    className: "text-red-300 bg-red-400/10 border-red-400/20",
    icon: AlertCircle,
  },
  major: {
    label: "Major",
    className: "text-orange-300 bg-orange-400/10 border-orange-400/20",
    icon: TriangleAlert,
  },
  minor: {
    label: "Minor",
    className: "text-yellow-200 bg-yellow-300/10 border-yellow-300/20",
    icon: AlertCircle,
  },
  info: {
    label: "Info",
    className: "text-blue-300 bg-blue-400/10 border-blue-400/20",
    icon: Info,
  },
};

const categoryConfig: Record<
  FindingCategory,
  {
    label: string;
    icon: typeof Bug;
  }
> = {
  architecture: {
    label: "Architecture",
    icon: Code2,
  },
  bug: {
    label: "Bug",
    icon: Bug,
  },
  security: {
    label: "Security",
    icon: LockKeyhole,
  },
  quality: {
    label: "Quality",
    icon: CheckCircle2,
  },
};

export function getHealthStatus(score: number): { label: string; color: string } {
  if (score >= 9) return { label: "Healthy", color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" };
  if (score >= 7) return { label: "Good", color: "text-[#ffeca0] border-[#ffeca0]/20 bg-[#ffeca0]/10" };
  if (score >= 5) return { label: "Needs attention", color: "text-orange-400 border-orange-400/20 bg-orange-400/10" };
  return { label: "Critical issues", color: "text-red-400 border-red-400/20 bg-red-400/10" };
}

export default function AIAnalysis({ analysis, onSelectFileLocation }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  const counts = useMemo(() => {
    if (!analysis) {
      return {
        critical: 0,
        major: 0,
        minor: 0,
        info: 0,
      };
    }

    return analysis.findings.reduce(
      (acc, finding) => {
        if (acc[finding.severity] !== undefined) {
          acc[finding.severity]++;
        }
        return acc;
      },
      {
        critical: 0,
        major: 0,
        minor: 0,
        info: 0,
      }
    );
  }, [analysis]);

  const filteredFindings = useMemo(() => {
    if (!analysis) return [];

    if (filter === "all") {
      return analysis.findings;
    }

    return analysis.findings.filter((finding) => finding.category === filter);
  }, [analysis, filter]);

  if (!analysis) {
    return (
      <aside className="flex h-full flex-col border-l border-white/10 bg-[#191818]">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffeca0]/5 border border-[#ffeca0]/10">
            <Sparkles className="h-5 w-5 text-[#ffeca0]/60" />
          </div>

          <p className="text-sm font-semibold text-white/80">AI Code Analysis</p>

          <p className="mt-2 text-xs leading-5 text-white/30 max-w-[240px]">
            Select a repository to initiate Gemini AI AST reasoning across architecture, bugs, security, and quality.
          </p>
        </div>
      </aside>
    );
  }

  const healthStatus = getHealthStatus(analysis.score);

  return (
    <aside className="flex h-full flex-col border-l border-white/10 bg-[#191818]">
      {/* Level 2: Repository Health Overview */}
      <div className="shrink-0 border-b border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ffeca0]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
              Repository Health
            </span>
          </div>

          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${healthStatus.color}`}>
            {healthStatus.label}
          </span>
        </div>

        {/* Score & Summary Box */}
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] p-3">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/30 font-medium">
              Overall AI Score
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#ffeca0]">
                {analysis.score.toFixed(1)}
              </span>
              <span className="text-xs text-white/30 font-medium">/ 10</span>
            </div>
          </div>

          <div className="text-right border-l border-white/5 pl-4">
            <p className="text-[9px] uppercase tracking-wider text-white/30 font-medium">
              Based on
            </p>
            <p className="text-xs font-semibold text-white/70 mt-0.5">
              {analysis.findings.length} findings
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="rounded-xl border border-white/5 bg-white/[0.015] p-3">
          <p className="text-[11px] leading-relaxed text-white/60">
            {analysis.summary}
          </p>
        </div>

        {/* Severity Count Grid */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <Count value={counts.critical} label="Critical" className="text-red-300 bg-red-500/10" />
          <Count value={counts.major} label="Major" className="text-orange-300 bg-orange-500/10" />
          <Count value={counts.minor} label="Minor" className="text-yellow-200 bg-yellow-500/10" />
          <Count value={counts.info} label="Info" className="text-blue-300 bg-blue-500/10" />
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="shrink-0 overflow-x-auto border-b border-white/10 px-3 py-2 scrollbar-none">
        <div className="flex min-w-max gap-1">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            All ({analysis.findings.length})
          </FilterButton>
          <FilterButton active={filter === "bug"} onClick={() => setFilter("bug")}>
            Bugs
          </FilterButton>
          <FilterButton active={filter === "security"} onClick={() => setFilter("security")}>
            Security
          </FilterButton>
          <FilterButton active={filter === "architecture"} onClick={() => setFilter("architecture")}>
            Architecture
          </FilterButton>
          <FilterButton active={filter === "quality"} onClick={() => setFilter("quality")}>
            Quality
          </FilterButton>
        </div>
      </div>

      {/* Findings Diagnostic Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredFindings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-400/60" />
            <p className="text-xs text-white/50 font-medium">No findings in this category.</p>
            <p className="text-[10px] text-white/30 mt-1">FixBS detected no architectural issues for this filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                expanded={expandedFinding === finding.id}
                onToggle={() =>
                  setExpandedFinding((current) =>
                    current === finding.id ? null : finding.id
                  )
                }
                onSelectFileLocation={onSelectFileLocation}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function FindingCard({
  finding,
  expanded,
  onToggle,
  onSelectFileLocation,
}: {
  finding: AIFinding;
  expanded: boolean;
  onToggle: () => void;
  onSelectFileLocation?: (file: string, line: number) => void;
}) {
  const severity = severityConfig[finding.severity] || severityConfig.info;
  const category = categoryConfig[finding.category] || categoryConfig.quality;

  const SeverityIcon = severity.icon;
  const CategoryIcon = category.icon;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        expanded
          ? "border-white/15 bg-white/[0.04] shadow-lg"
          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]"
      }`}
    >
      <div className="w-full p-3 text-left cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0 text-white/30">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${severity.className}`}
              >
                <SeverityIcon className="h-2.5 w-2.5" />
                {severity.label}
              </span>

              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/40">
                <CategoryIcon className="h-2.5 w-2.5" />
                {category.label}
              </span>
            </div>

            <p className="text-xs font-semibold leading-relaxed text-white/85">
              {finding.title}
            </p>

            <div className="mt-2 flex items-center justify-between text-[10px] text-white/40 font-mono">
              <span className="truncate max-w-[180px]">{finding.file}</span>
              <span className="text-white/30">L{finding.line}</span>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 bg-[#151414]/50 px-3.5 pb-3.5 pt-3">
          <div className="space-y-3 text-left">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/30">
                WHY THIS MATTERS
              </p>
              <p className="text-[11px] leading-relaxed text-white/60">
                {finding.explanation}
              </p>
            </div>

            <div className="rounded-lg border border-[#ffeca0]/15 bg-[#ffeca0]/[0.03] p-2.5">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#ffeca0]/60">
                RECOMMENDATION
              </p>
              <p className="text-[11px] leading-relaxed text-white/70">
                {finding.recommendation}
              </p>
            </div>

            {/* Evidence File Action Button */}
            {onSelectFileLocation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFileLocation(finding.file, finding.line);
                }}
                className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-[#ffeca0] hover:text-[#1c1b1b]"
              >
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Code2 className="h-3.5 w-3.5" />
                  <span className="truncate">{finding.file}:{finding.line}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span>View source</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Count({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className={`rounded-lg p-2 text-center border border-white/5 ${className}`}>
      <p className="text-xs font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition ${
        active
          ? "bg-[#ffeca0] text-[#1c1b1b] font-semibold shadow"
          : "text-white/40 hover:bg-white/5 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}
