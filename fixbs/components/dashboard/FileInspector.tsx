"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Box,
  Braces,
  FileCode2,
  FunctionSquare,
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
};

export default function FileInspector({ file }: Props) {
  if (!file) {
    return (
      <aside className="flex h-full flex-col items-center justify-center border-l border-white/10 bg-[#191818] px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
          <FileCode2 className="h-5 w-5 text-white/30" />
        </div>

        <h3 className="text-sm font-medium text-white/70">Select a file</h3>

        <p className="mt-1 max-w-[220px] text-xs leading-5 text-white/35">
          Select a node from the dependency graph to inspect its AST and
          relationships.
        </p>
      </aside>
    );
  }

  return (
    <aside className="h-full overflow-y-auto border-l border-white/10 bg-[#191818]">
      {/* Header */}

      <div className="border-b border-white/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ffeca0]/10">
            <FileCode2 className="h-5 w-5 text-[#ffeca0]" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {file.name}
            </h2>

            <p className="mt-1 break-all text-[11px] leading-4 text-white/35">
              {file.path}
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}

      <section className="border-b border-white/10 p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Overview
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

          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
            Depends on
          </p>
        </div>

        {file.dependencies.length === 0 ? (
          <EmptyText>No internal dependencies</EmptyText>
        ) : (
          <div className="space-y-1.5">
            {file.dependencies.map((dependency) => (
              <RelationshipItem key={dependency} value={dependency} />
            ))}
          </div>
        )}
      </section>

      {/* Dependents */}

      <section className="border-b border-white/10 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ArrowUpFromLine className="h-3.5 w-3.5 text-[#6c63ff]" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
            Used by
          </p>
        </div>

        {file.dependents.length === 0 ? (
          <EmptyText>Nothing depends on this file</EmptyText>
        ) : (
          <div className="space-y-1.5">
            {file.dependents.map((dependent) => (
              <RelationshipItem key={dependent} value={dependent} />
            ))}
          </div>
        )}
      </section>

      {/* Functions */}

      <section className="p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Functions
        </p>

        {file.functions.length === 0 ? (
          <EmptyText>No functions detected</EmptyText>
        ) : (
          <div className="space-y-1.5">
            {file.functions.map((fn) => (
              <div
                key={`${fn.name}-${fn.line}`}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
              >
                <span className="font-mono text-xs text-white/70">
                  {fn.name}()
                </span>

                <span className="text-[10px] text-white/25">L{fn.line}</span>
              </div>
            ))}
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

      <p className="text-[10px] text-white/30">{label}</p>

      <p className="mt-0.5 truncate text-xs font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}

function RelationshipItem({ value }: { value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-3 py-2">
      <p className="truncate font-mono text-[11px] text-white/60">{value}</p>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-white/25">{children}</p>;
}
