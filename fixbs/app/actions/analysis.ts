"use server";

import { ingestRepository } from "./github";
import { buildAIContext } from "@/lib/ai/context";
import { analyzeRepository } from "@/lib/ai/analyze";

export async function analyzeRepositoryWithAI(
  accessToken: string,
  owner: string,
  repo: string,
) {
  const repository = await ingestRepository(accessToken, owner, repo);

  if (!repository) {
    throw new Error("Failed to ingest repository.");
  }

  const context = buildAIContext(repository.files, repository.dependencyGraph);

  const analysis = await analyzeRepository(context);

  return {
    repository,
    analysis,
  };
}
