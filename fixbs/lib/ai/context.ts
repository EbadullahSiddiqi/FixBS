import type { RepositoryFile } from "../../app/actions/github";

export type AIFileContext = {
  path: string;
  content: string;
};

export type AIDependencyContext = {
  from: string;
  to: string;
  imports: string[];
};

export type AIContext = {
  files: AIFileContext[];

  dependencies: AIDependencyContext[];

  externalDependencies: string[];
};

type DependencyGraph = {
  nodes: Array<{
    id: string;
    path: string;
    name: string;
    language?: string;
    functions?: { name: string; line: number }[];
    classes?: { name: string; line: number }[];
    components?: { name: string; line: number }[];
    imports?: string[];
    exports?: string[];
  }>;

  edges: Array<{
    from: string;
    to: string;
    imports?: string[];
  }>;

  externalDependencies?: string[];
};

export function buildAIContext(
  files: RepositoryFile[],
  dependencyGraph: DependencyGraph,
): AIContext {
  const graphNodes = new Map(
    dependencyGraph.nodes.map((node) => [node.id, node]),
  );

  const contextFiles: AIFileContext[] = files.map((file) => ({
    path: file.path,
    content: file.content,
  }));

  const dependencies: AIDependencyContext[] = dependencyGraph.edges.map(
    (edge) => ({
      from: graphNodes.get(edge.from)?.path ?? edge.from,
      to: graphNodes.get(edge.to)?.path ?? edge.to,
      imports: edge.imports ?? [],
    }),
  );

  return {
    files: contextFiles,
    dependencies,
    externalDependencies: dependencyGraph.externalDependencies ?? [],
  };
}
