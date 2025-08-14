"use client";

import { useState } from "react";

export default function FileUploadDashboard() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1b1b] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#262424] rounded-2xl p-8 shadow-lg border border-[#ffeca0]">
        <h1 className="text-2xl font-semibold text-[#ffeca0] mb-6 text-center">
          File Analysis Dashboard
        </h1>

        <label className="block mb-4">
          <span className="text-gray-300">Select a file to analyze:</span>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#ffeca0] file:text-black
              hover:file:bg-yellow-200
              cursor-pointer"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-2 rounded-lg font-semibold transition-colors ${
            isUploading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[#ffeca0] text-black hover:bg-yellow-200"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </div>
    </div>
  );
}
