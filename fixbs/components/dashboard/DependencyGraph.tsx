"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import CodeNode, { type CodeNodeData } from "./CodeNode";

import { useMemo } from "react";

type DependencyNode = {
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

type DependencyEdge = {
  from: string;
  to: string;
  imports: string[];
};

type DependencyGraphData = {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
};

type Props = {
  graph: DependencyGraphData;
  onSelectFile: (node: DependencyNode) => void;
};

const nodeTypes = {
  code: CodeNode,
};

export default function DependencyGraph({ graph, onSelectFile }: Props) {
  /*
  |--------------------------------------------------------------------------
  | Create React Flow nodes
  |--------------------------------------------------------------------------
  */

  const initialNodes = useMemo<Node<CodeNodeData>[]>(() => {
    /*
      | Simple grid for now.
      |
      | Later we'll replace this with
      | automatic graph layout using
      | a layout engine.
      */

    return graph.nodes.map((node, index) => {
      const columns = 3;

      const column = index % columns;

      const row = Math.floor(index / columns);

      return {
        id: node.id,

        type: "code",

        position: {
          x: column * 320,
          y: row * 220,
        },

        data: {
          name: node.name,

          path: node.path,

          language: node.language,

          functions: node.functions,

          components: node.components,
        },
      };
    });
  }, [graph.nodes]);

  /*
  |--------------------------------------------------------------------------
  | Create React Flow edges
  |--------------------------------------------------------------------------
  */

  const initialEdges = useMemo<Edge[]>(
    () =>
      graph.edges.map((edge, index) => ({
        id: `${edge.from}-${edge.to}-${index}`,

        source: edge.from,

        target: edge.to,

        animated: false,

        style: {
          stroke: "rgba(255, 236, 160, 0.45)",

          strokeWidth: 1.5,
        },

        label:
          edge.imports.length > 0
            ? edge.imports.slice(0, 2).join(", ")
            : undefined,

        labelStyle: {
          fill: "rgba(255,255,255,0.45)",

          fontSize: 10,
        },

        labelBgStyle: {
          fill: "#1c1b1b",

          fillOpacity: 0.9,
        },

        labelBgPadding: [5, 3],

        labelBgBorderRadius: 4,
      })),
    [graph.edges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  /*
  |--------------------------------------------------------------------------
  | Select node
  |--------------------------------------------------------------------------
  */

  function handleNodeClick(_: React.MouseEvent, clickedNode: Node) {
    const file = graph.nodes.find((node) => node.id === clickedNode.id);

    if (file) {
      onSelectFile(file);
    }
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#151414]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background gap={24} size={1} color="rgba(255,255,255,0.06)" />

        <Controls className="!border-white/10 !bg-[#1c1b1b]" />

        <MiniMap
          nodeColor="#ffeca0"
          maskColor="rgba(10,10,10,0.75)"
          className="!border-white/10 !bg-[#1c1b1b]"
        />
      </ReactFlow>
    </div>
  );
}
