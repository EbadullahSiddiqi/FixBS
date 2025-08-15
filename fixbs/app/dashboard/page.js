"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";

export default function FileUploadDashboard() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileContent, setfileContent] = useState("");

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

      // Parse the JSON result from the API
      let parsedResult;
      try {
        parsedResult = JSON.parse(data.result);
        const text = await file.text();
        setfileContent(text);
      } catch (e) {
        // If parsing fails, show error message
        alert("Error parsing analysis results. Please try again.");
        const text = await file.text();
        setfileContent(text);
        return;
      }

      setAnalysisResult(parsedResult);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setAnalysisResult(null); // Reset previous results
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "major":
        return "text-orange-400 bg-orange-400/10 border-orange-400/30";
      case "minor":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "info":
        return "text-[#5CC8FF] bg-[#5CC8FF]/10 border-[#5CC8FF]/30";
      default:
        return "text-[#A3A3A3] bg-gray-400/10 border-gray-400/30";
    }
  };

  const getSeverityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "security":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "logic":
        return <Zap className="w-4 h-4 text-orange-400" />;
      case "style":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "syntax":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-[#A3A3A3]" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "security":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "logic":
        return <Zap className="w-4 h-4 text-orange-400" />;
      case "style":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "syntax":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-[#A3A3A3]" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "security":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "logic":
        return "text-orange-400 bg-orange-400/10 border-orange-400/30";
      case "style":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      case "syntax":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      default:
        return "text-[#A3A3A3] bg-gray-400/10 border-gray-400/30";
    }
  };

  const getStats = () => {
    if (!analysisResult || !Array.isArray(analysisResult)) return null;

    const stats = {
      total: analysisResult.length,
      critical: analysisResult.filter((item) => item.severity === "critical")
        .length,
      major: analysisResult.filter((item) => item.severity === "major").length,
      minor: analysisResult.filter((item) => item.severity === "minor").length,
      info: analysisResult.filter((item) => item.severity === "info").length,
      // Type-based stats
      security: analysisResult.filter((item) => item.type === "security")
        .length,
      logic: analysisResult.filter((item) => item.type === "logic").length,
      style: analysisResult.filter((item) => item.type === "style").length,
      syntax: analysisResult.filter((item) => item.type === "syntax").length,
    };

    return stats;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#1C1B1B] text-white">
      {/* Header */}
      <header className="border-b border-[#6C63FF]/20 bg-[#1C1B1B]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#FFEC9F] rounded-lg">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <Link href="/" className="text-2xl font-bold text-white">
                  FixBS
                </Link>
                <p className="text-[#A3A3A3] text-sm">
                  Code Analysis Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-[#5CC8FF]">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#262424] rounded-2xl p-6 shadow-xl border border-[#6C63FF]/30">
              <div className="flex items-center space-x-3 mb-6">
                <Upload className="w-5 h-5 text-[#FFEC9F]" />
                <h2 className="text-lg font-semibold text-white">
                  Upload File
                </h2>
              </div>

              <label className="block mb-6">
                <span className="text-[#A3A3A3] text-sm mb-2 block">
                  Select a code file to analyze:
                </span>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.php,.rb,.go,.rs"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[#6C63FF]/50 rounded-xl cursor-pointer hover:border-[#FFEC9F]/50 transition-colors group"
                  >
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-[#6C63FF] group-hover:text-[#FFEC9F] mx-auto mb-2 transition-colors" />
                      <p className="text-sm text-[#A3A3A3] group-hover:text-white transition-colors">
                        {fileName || "Click to select file"}
                      </p>
                    </div>
                  </label>
                </div>
              </label>

              <button
                onClick={handleUpload}
                disabled={isUploading || !file}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isUploading || !file
                    ? "bg-[#A3A3A3]/20 text-[#A3A3A3] cursor-not-allowed"
                    : "bg-[#FFEC9F] text-black hover:bg-[#FFEC9F]/90 hover:shadow-lg hover:shadow-[#FFEC9F]/20"
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  "Upload & Analyze"
                )}
              </button>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-[#FFEC9F] mb-3">
                  Issue Breakdown
                </h3>

                {/* Severity Stats */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">
                    By Severity
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#1C1B1B] rounded-lg p-3 border border-red-400/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A3A3A3] text-xs">Critical</span>
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      </div>
                      <p className="text-lg font-bold text-red-400 mt-1">
                        {stats.critical}
                      </p>
                    </div>
                    <div className="bg-[#1C1B1B] rounded-lg p-3 border border-orange-400/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A3A3A3] text-xs">Major</span>
                        <AlertCircle className="w-3 h-3 text-orange-400" />
                      </div>
                      <p className="text-lg font-bold text-orange-400 mt-1">
                        {stats.major}
                      </p>
                    </div>
                    <div className="bg-[#1C1B1B] rounded-lg p-3 border border-yellow-400/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A3A3A3] text-xs">Minor</span>
                        <Info className="w-3 h-3 text-yellow-400" />
                      </div>
                      <p className="text-lg font-bold text-yellow-400 mt-1">
                        {stats.minor}
                      </p>
                    </div>
                    <div className="bg-[#1C1B1B] rounded-lg p-3 border border-[#5CC8FF]/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A3A3A3] text-xs">Info</span>
                        <CheckCircle className="w-3 h-3 text-[#5CC8FF]" />
                      </div>
                      <p className="text-lg font-bold text-[#5CC8FF] mt-1">
                        {stats.info}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type Stats */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">
                    By Category
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {stats.security > 0 && (
                      <div className="bg-[#1C1B1B] rounded-lg p-3 border border-red-400/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A3A3A3] text-xs">
                            Security
                          </span>
                          <AlertCircle className="w-3 h-3 text-red-400" />
                        </div>
                        <p className="text-lg font-bold text-red-400 mt-1">
                          {stats.security}
                        </p>
                      </div>
                    )}
                    {stats.logic > 0 && (
                      <div className="bg-[#1C1B1B] rounded-lg p-3 border border-orange-400/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A3A3A3] text-xs">Logic</span>
                          <Zap className="w-3 h-3 text-orange-400" />
                        </div>
                        <p className="text-lg font-bold text-orange-400 mt-1">
                          {stats.logic}
                        </p>
                      </div>
                    )}
                    {stats.style > 0 && (
                      <div className="bg-[#1C1B1B] rounded-lg p-3 border border-blue-400/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A3A3A3] text-xs">Style</span>
                          <FileText className="w-3 h-3 text-blue-400" />
                        </div>
                        <p className="text-lg font-bold text-blue-400 mt-1">
                          {stats.style}
                        </p>
                      </div>
                    )}
                    {stats.syntax > 0 && (
                      <div className="bg-[#1C1B1B] rounded-lg p-3 border border-yellow-400/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A3A3A3] text-xs">Syntax</span>
                          <AlertCircle className="w-3 h-3 text-yellow-400" />
                        </div>
                        <p className="text-lg font-bold text-yellow-400 mt-1">
                          {stats.syntax}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!analysisResult ? (
              <div className="bg-[#262424] rounded-2xl p-8 shadow-xl border border-[#6C63FF]/30 text-center">
                <div className="max-w-md mx-auto">
                  <TrendingUp className="w-16 h-16 text-[#6C63FF] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-[#A3A3A3]">
                    Upload a code file to get started with AI-powered code
                    analysis. We'll identify syntax errors, logical issues, and
                    provide improvement suggestions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#262424] rounded-2xl p-6 shadow-xl border border-[#6C63FF]/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    Analysis Results
                  </h2>
                  <div className="flex items-center space-x-2 text-[#FFEC9F]">
                    <span className="text-sm font-medium">
                      Total Issues: {stats?.total || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Array.isArray(analysisResult) &&
                    analysisResult.map((issue, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border ${getSeverityColor(
                          issue.severity
                        )}`}
                      >
                        <div className="flex items-start space-x-3">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-[#FFEC9F] capitalize">
                                {issue.severity}{" "}
                                {issue.type && `• ${issue.type}`}
                              </span>
                              {issue.line && (
                                <span className="text-xs text-[#A3A3A3] bg-[#A3A3A3]/10 px-2 py-1 rounded-full">
                                  Line {issue.line}
                                </span>
                              )}
                            </div>
                            <p className="text-white text-sm leading-relaxed">
                              {issue.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {(!Array.isArray(analysisResult) ||
                    analysisResult.length === 0) && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-[#5CC8FF] mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Great job!
                      </h3>
                      <p className="text-[#A3A3A3]">
                        No issues found in your code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="bg-[#262424] mt-10 rounded-2xl p-6 shadow-xl border border-[#6C63FF]/30">
              <Editor
                value={fileContent}
                onValueChange={(code) => setCode(code)}
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
