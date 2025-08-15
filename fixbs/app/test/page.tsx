"use client";

import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another

export default function page() {
  const [code, setCode] = React.useState(
    `
    const formData = await request.formData();
    const file = formData.get("file") as File;
     
    const fileContent = await file.text();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });


    `
  );
  return (
    <Editor
      value={code}
      onValueChange={(code) => setCode(code)}
      highlight={(code) => highlight(code, languages.js)}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
      }}
    />
  );
}
