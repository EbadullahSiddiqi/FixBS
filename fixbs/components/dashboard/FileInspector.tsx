"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Box,
  Braces,
  FileCode2,
  FunctionSquare,
  Hash,
  AlertCircle,
} from "lucide-react";

type FileNode = {
  id: string;
  name: string;
  path: string;
  language: string;

  functions: {
    name: string;
    line: number;
  }[];

  classes: {
    name: string;
    line: number;
  }[];

  components: {
    name: string;
    line: number;
  }[];

  imports: {
    source: string;
    names: string[];
  }[];

  exports: {
    name: string;
    type: string;
  }[];

  dependencies: string[];

  dependents: string[];
};

type Props = {
  file: FileNode | null;
  targetLine?: number | null;
};

export default function FileInspector({ file, targetLine }: Props) {
  if (!file) {
    return (
      <aside className="flex h-full flex-col items-center justify-center border-l border-white/10 bg-[#191818] px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
          <FileCode2 className="h-5 w-5 text-white/30" />
        </div>

        <h3 className="text-sm font-semibold text-white/80">Select a file</h3>

        <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-white/30">
          Select a file from the sidebar or click a node in the dependency graph to inspect its AST elements and relationships.
        </p>
      </aside>
    );
  }

  return (
    <aside className="h-full overflow-y-auto border-l border-white/10 bg-[#191818]">
      {/* File Header */}
      <div className="border-b border-white/10 p-5 bg-[#151414]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffeca0]/10 border border-[#ffeca0]/20">
            <FileCode2 className="h-5 w-5 text-[#ffeca0]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="truncate text-sm font-bold text-white font-mono">
                {file.name}
              </h2>
              <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-mono text-[#ffeca0] uppercase">
                {file.language}
              </span>
            </div>

            <p className="mt-1 break-all font-mono text-[10px] leading-relaxed text-white/40 bg-white/[0.02] p-1.5 rounded border border-white/5">
              {file.path}
            </p>
          </div>
        </div>

        {/* Target Line Highlight Banner (from finding link) */}
        {targetLine && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#ffeca0]/30 bg-[#ffeca0]/10 p-2.5 text-xs text-[#ffeca0]">
            <Hash className="h-4 w-4 shrink-0" />
            <span className="font-semibold">Target Line Evidence:</span>
            <span className="font-mono font-bold">Line {targetLine}</span>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      <section className="border-b border-white/10 p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
          AST Structure
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Stat icon={<Braces />} label="Language" value={file.language} />
          <Stat
            icon={<FunctionSquare />}
            label="Functions"
            value={file.functions.length}
          />
          <Stat
            icon={<Box />}
            label="Components"
            value={file.components.length}
          />
          <Stat
            icon={<FileCode2 />}
            label="Exports"
            value={file.exports.length}
          />
        </div>
      </section>

      {/* Dependencies */}
      <section className="border-b border-white/10 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ArrowDownToLine className="h-3.5 w-3.5 text-[#ffeca0]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
            Depends on ({file.dependencies.length})
          </p>
        </div>

        {file.dependencies.length === 0 ? (
          <EmptyText>No internal dependencies</EmptyText>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {file.dependencies.map((dependency) => (
              <RelationshipItem key={dependency} value={dependency} />
            ))}
          </div>
        )}
      </section>

      {/* Dependents */}
      <section className="border-b border-white/10 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ArrowUpFromLine className="h-3.5 w-3.5 text-[#ffeca0]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
            Used by ({file.dependents.length})
          </p>
        </div>

        {file.dependents.length === 0 ? (
          <EmptyText>Nothing depends on this file</EmptyText>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {file.dependents.map((dependent) => (
              <RelationshipItem key={dependent} value={dependent} />
            ))}
          </div>
        )}
      </section>

      {/* Functions & Elements */}
      <section className="p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
          Functions & Elements
        </p>

        {file.functions.length === 0 ? (
          <EmptyText>No functions detected</EmptyText>
        ) : (
          <div className="space-y-1.5">
            {file.functions.map((fn) => {
              const isTarget = targetLine && Math.abs(fn.line - targetLine) <= 3;
              return (
                <div
                  key={`${fn.name}-${fn.line}`}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                    isTarget
                      ? "bg-[#ffeca0]/15 border border-[#ffeca0]/40 text-[#ffeca0]"
                      : "bg-white/[0.03] text-white/70"
                  }`}
                >
                  <span className="font-mono text-xs">
                    {fn.name}()
                  </span>

                  <span className={`text-[10px] font-mono ${isTarget ? "font-bold text-[#ffeca0]" : "text-white/30"}`}>
                    L{fn.line}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.025] p-3">
      <div className="mb-2 h-3.5 w-3.5 text-white/30 [&>svg]:h-full [&>svg]:w-full">
        {icon}
      </div>
      <p className="text-[10px] text-white/30 font-medium">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-white/80">
        {value}
      </p>
    </div>
  );
}

function RelationshipItem({ value }: { value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-1.5">
      <p className="truncate font-mono text-[11px] text-white/60">{value}</p>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-white/25 italic">{children}</p>;
}
