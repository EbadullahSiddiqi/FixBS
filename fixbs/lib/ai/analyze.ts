import { GoogleGenAI } from "@google/genai";

import type { AIContext } from "./context";
import type { AIAnalysis } from "./types";
import { buildAnalysisPrompt } from "./prompt";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function extractJSON(text: string): string {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (objectStart === -1 || objectEnd === -1) {
    throw new Error("Gemini did not return valid JSON.");
  }

  return cleaned.slice(objectStart, objectEnd + 1);
}

function validateAnalysis(data: unknown): AIAnalysis {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI analysis response.");
  }

  const analysis = data as Partial<AIAnalysis>;

  if (
    typeof analysis.score !== "number" ||
    typeof analysis.summary !== "string" ||
    !Array.isArray(analysis.findings)
  ) {
    throw new Error("AI response does not match the expected schema.");
  }

  return {
    score: Math.max(0, Math.min(10, analysis.score)),
    summary: analysis.summary,
    findings: analysis.findings,
  };
}

export async function analyzeRepository(
  context: AIContext,
): Promise<AIAnalysis> {
  const prompt = buildAnalysisPrompt(context);

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const text = response.text ?? "";

  if (!text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  const jsonText = extractJSON(text);

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Gemini returned malformed JSON.");
  }

  return validateAnalysis(parsed);
}
