import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const fileContent = await file.text();

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

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

  const result = await model.generateContent(prompt);
  var text = result.response.text();

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
