"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { FileCode2, Box, Braces } from "lucide-react";

export type CodeNodeData = {
  name: string;
  path: string;
  language: string;
  functions: {
    name: string;
    line: number;
  }[];
  components: {
    name: string;
    line: number;
  }[];
  selected?: boolean;
};

export default function CodeNode({
  data,
  selected,
}: NodeProps & {
  data: CodeNodeData;
}) {
  const isComponent = data.components.length > 0;

  return (
    <div
      className={`
        relative min-w-[220px]
        overflow-hidden rounded-xl
        border
        bg-[#1c1b1b]
        shadow-2xl
        transition-all duration-200
        ${
          selected
            ? "border-[#ffeca0] shadow-[0_0_25px_rgba(255,236,160,0.18)]"
            : "border-white/10 hover:border-white/20"
        }
      `}
    >
      {/* Incoming connection */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-[#ffeca0]"
      />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffeca0]/10">
          {isComponent ? (
            <Box className="h-4 w-4 text-[#ffeca0]" />
          ) : (
            <FileCode2 className="h-4 w-4 text-[#ffeca0]" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {data.name}
          </p>

          <p className="max-w-[150px] truncate text-[11px] text-white/40">
            {data.path}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <Braces className="h-3.5 w-3.5" />

          <span>{data.language}</span>
        </div>

        <div className="flex gap-2">
          {data.functions.length > 0 && (
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-white/60">
              {data.functions.length} function
              {data.functions.length !== 1 ? "s" : ""}
            </span>
          )}

          {data.components.length > 0 && (
            <span className="rounded-md bg-[#ffeca0]/10 px-2 py-1 text-[10px] text-[#ffeca0]">
              {data.components.length} component
              {data.components.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Outgoing connection */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-[#ffeca0]"
      />
    </div>
  );
}
