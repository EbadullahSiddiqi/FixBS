import { parseFile, ParsedFile } from "./parser";

type SourceFile = {
  path: string;
  name: string;
  content: string;
};

export function analyzeFiles(files: SourceFile[]): ParsedFile[] {
  const parsedFiles: ParsedFile[] = [];

  for (const file of files) {
    const parsed = parseFile(file);

    if (!parsed) {
      continue;
    }

    parsedFiles.push(parsed);
  }

  return parsedFiles;
}
