import type { AIContext } from "./context";

export function buildAnalysisPrompt(context: AIContext): string {
  const files = context.files
    .map(
      (file) => `
===== FILE: ${file.path} =====

${file.content}

===== END FILE =====
`,
    )
    .join("\n");

  const dependencies = context.dependencies
    .map((dependency) => {
      const imports =
        dependency.imports.length > 0
          ? ` | imports: ${dependency.imports.join(", ")}`
          : "";

      return `${dependency.from} -> ${dependency.to}${imports}`;
    })
    .join("\n");

  const externalDependencies =
    context.externalDependencies.length > 0
      ? context.externalDependencies.join(", ")
      : "None detected";

  return `
You are FixBS, an expert software engineering code analysis system.

Analyze the provided JavaScript/TypeScript repository.

Your job is to identify meaningful problems in four categories:

1. architecture
2. bug
3. security
4. quality

Do NOT report every stylistic preference.

Only report issues that are actually useful to a developer.

==================================================
SEVERITY DEFINITIONS
==================================================

critical:
The issue can cause catastrophic failure, serious security compromise,
data loss, or makes the application fundamentally unusable.

major:
The issue can cause incorrect behavior, significant bugs, security
vulnerabilities, or serious architectural problems.

minor:
The issue is relatively low impact but should still be addressed.

info:
A useful improvement, recommendation, or observation that is not
necessarily a defect.

==================================================
IMPORTANT RULES
==================================================

- Only report issues you can reasonably support from the provided code.
- Do not invent files, functions, variables, or line numbers.
- Every finding MUST reference an actual file.
- Every finding MUST contain the line number where the issue occurs.
- Prefer precise findings over vague recommendations.
- Do not report duplicate findings.
- Do not complain about formatting unless it creates a meaningful
  maintainability problem.
- Consider relationships between files when analyzing architecture.
- Consider external dependencies when analyzing security and quality.
- Look for authentication problems, exposed secrets, unsafe input handling,
  injection risks, authorization problems, insecure API usage, and data leaks.
- Look for logical errors, incorrect conditions, broken async behavior,
  missing error handling, and suspicious state management.
- Look for circular dependencies, excessive coupling, poor separation of
  concerns, and architectural inconsistencies.
- Consider the project as a whole rather than analyzing every file in
  isolation.

==================================================
REPOSITORY DEPENDENCY GRAPH
==================================================

${dependencies || "No internal dependencies detected."}

==================================================
EXTERNAL DEPENDENCIES
==================================================

${externalDependencies}

==================================================
SOURCE CODE
==================================================

${files}

==================================================
RESPONSE FORMAT
==================================================

Return ONLY valid JSON.

Do not wrap the JSON in markdown.
Do not include \`\`\`json.
Do not include explanations outside the JSON.

Use exactly this structure:

{
  "score": 0,
  "summary": "Short overall assessment of the repository",
  "findings": [
    {
      "id": "finding-1",
      "severity": "critical | major | minor | info",
      "category": "architecture | bug | security | quality",
      "file": "path/to/file.ts",
      "line": 1,
      "title": "Short issue title",
      "explanation": "Explain why this is a problem.",
      "recommendation": "Explain how the developer should fix it."
    }
  ]
}

The score must be a number from 0 to 10.

10 = excellent codebase with no meaningful issues.
8-9 = strong codebase with only minor issues.
6-7 = reasonable codebase with several issues.
4-5 = significant problems.
0-3 = severe problems or fundamentally broken code.

Be conservative with the score.

Return the final JSON now.
`;
}
