import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize with the new API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const fileContent = await file.text();

  const prompt = `
          You are a code review AI. Analyze the following code and
          list all syntax or logical errors, security errors, any other error clearly:
          
          Return only the errors in the form of a JSON array.
          Do not include any other text or explanations.
          Return a severity level for each error:
            - "critical" for errors that will cause the code to fail
            - "major" for errors that will cause incorrect behavior
            - "minor" for stylistic issues or best practices
            - "info" for informational messages or suggestions

            Return each error with the following structure:
            {
              line: [line number],
              message: [error message],
              severity: [severity level],
              type: [error type, e.g., "syntax", "logic", "security", "style"],
            }

            Here's the file's content:   ${fileContent}
        `;

  // Use the new generateContent method
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  let text = response.text || "";

  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");

  // Try to find JSON array in the text
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  // Trim whitespace
  text = text.trim();

  // console.log(text);

  return NextResponse.json({
    result: text,
  });
}
