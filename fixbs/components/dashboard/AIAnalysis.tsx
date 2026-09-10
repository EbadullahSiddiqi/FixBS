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
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

type FindingSeverity = "critical" | "major" | "minor" | "info";

type FindingCategory = "architecture" | "bug" | "security" | "quality";

type AIFinding = {
  id: string;
  severity: FindingSeverity;
  category: FindingCategory;
  file: string;
  line: number;
  title: string;
  explanation: string;
  recommendation: string;
};

type AIAnalysisData = {
  score: number;
  summary: string;
  findings: AIFinding[];
};

type Filter = "all" | FindingCategory;

type Props = {
  analysis: AIAnalysisData | null;
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

export default function AIAnalysis({ analysis }: Props) {
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
        acc[finding.severity]++;
        return acc;
      },
      {
        critical: 0,
        major: 0,
        minor: 0,
        info: 0,
      },
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
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffeca0]/5">
            <Sparkles className="h-5 w-5 text-[#ffeca0]/50" />
          </div>

          <p className="text-sm font-medium text-white/60">AI analysis</p>

          <p className="mt-2 text-xs leading-5 text-white/25">
            Select a repository to let FixBS analyze its architecture, bugs,
            security, and code quality.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col border-l border-white/10 bg-[#191818]">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#ffeca0]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                AI Analysis
              </p>
            </div>

            <p className="mt-1.5 text-xs leading-5 text-white/40">
              Automated code intelligence
            </p>
          </div>

          <ScoreBadge score={analysis.score} />
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.025] p-3">
          <p className="text-[11px] leading-5 text-white/55">
            {analysis.summary}
          </p>
        </div>

        {/* Finding counts */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <Count
            value={counts.critical}
            label="Critical"
            className="text-red-300"
          />

          <Count
            value={counts.major}
            label="Major"
            className="text-orange-300"
          />

          <Count
            value={counts.minor}
            label="Minor"
            className="text-yellow-200"
          />

          <Count value={counts.info} label="Info" className="text-blue-300" />
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0 overflow-x-auto border-b border-white/10 px-3 py-2">
        <div className="flex min-w-max gap-1">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </FilterButton>

          <FilterButton
            active={filter === "bug"}
            onClick={() => setFilter("bug")}
          >
            Bugs
          </FilterButton>

          <FilterButton
            active={filter === "security"}
            onClick={() => setFilter("security")}
          >
            Security
          </FilterButton>

          <FilterButton
            active={filter === "architecture"}
            onClick={() => setFilter("architecture")}
          >
            Architecture
          </FilterButton>

          <FilterButton
            active={filter === "quality"}
            onClick={() => setFilter("quality")}
          >
            Quality
          </FilterButton>
        </div>
      </div>

      {/* Findings */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredFindings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <CheckCircle2 className="mb-3 h-6 w-6 text-[#ffeca0]/40" />
            <p className="text-xs text-white/40">
              No findings in this category.
            </p>
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
                    current === finding.id ? null : finding.id,
                  )
                }
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
}: {
  finding: AIFinding;
  expanded: boolean;
  onToggle: () => void;
}) {
  const severity = severityConfig[finding.severity];
  const category = categoryConfig[finding.category];

  const SeverityIcon = severity.icon;
  const CategoryIcon = category.icon;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        expanded
          ? "border-white/10 bg-white/[0.035]"
          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]"
      }`}
    >
      <button onClick={onToggle} className="w-full p-3 text-left">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0 text-white/25">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${severity.className}`}
              >
                <SeverityIcon className="h-2.5 w-2.5" />
                {severity.label}
              </span>

              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/35">
                <CategoryIcon className="h-2.5 w-2.5" />
                {category.label}
              </span>
            </div>

            <p className="text-xs font-medium leading-5 text-white/75">
              {finding.title}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/25">
              <span className="max-w-[180px] truncate">{finding.file}</span>

              <span>·</span>

              <span>line {finding.line}</span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-3 pb-3 pt-3">
          <div className="ml-6 space-y-3">
            <div>
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
                Explanation
              </p>

              <p className="text-[11px] leading-5 text-white/50">
                {finding.explanation}
              </p>
            </div>

            <div className="rounded-lg border border-[#ffeca0]/10 bg-[#ffeca0]/[0.03] p-2.5">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#ffeca0]/50">
                Recommendation
              </p>

              <p className="text-[11px] leading-5 text-white/55">
                {finding.recommendation}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-white/25">
              <Code2 className="h-3 w-3" />
              <span>
                {finding.file}:{finding.line}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const roundedScore = score.toFixed(1);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#ffeca0]/10 bg-[#ffeca0]/5 px-2.5 py-1.5">
      <div className="h-1.5 w-1.5 rounded-full bg-[#ffeca0]" />

      <div>
        <p className="text-[9px] uppercase tracking-wider text-white/25">
          Score
        </p>

        <p className="text-xs font-semibold text-[#ffeca0]">
          {roundedScore}/10
        </p>
      </div>
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
    <div className="rounded-lg bg-white/[0.025] px-2 py-2">
      <p className={`text-sm font-semibold ${className}`}>{value}</p>

      <p className="mt-0.5 text-[8px] uppercase tracking-wide text-white/20">
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
      className={`rounded-md px-2.5 py-1.5 text-[10px] transition ${
        active
          ? "bg-[#ffeca0]/10 text-[#ffeca0]"
          : "text-white/30 hover:bg-white/5 hover:text-white/60"
      }`}
    >
      {children}
    </button>
  );
}
