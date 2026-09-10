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

export type AIAnalysis = {
  score: number;

  summary: string;

  findings: AIFinding[];
};
