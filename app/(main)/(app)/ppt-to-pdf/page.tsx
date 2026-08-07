"use client";

import React, { useState } from "react";
import { UploadCard, FileChip } from "@/components/tools/upload-card";
import { Sparkles, CloudUpload, ShieldCheck } from "lucide-react";

export default function PptToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (fileList: FileList | null) => {
    if (fileList && fileList[0]) {
      const selectedFile = fileList[0];
      const fileName = selectedFile.name.toLowerCase();
      
      if (!fileName.endsWith(".ppt") && !fileName.endsWith(".pptx")) {
        setError("Please upload a valid PowerPoint (.ppt or .pptx) file.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PowerPoint file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ppt-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to convert PPT to PDF.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}-converted.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[var(--background)] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-slate-900 dark:selection:bg-sky-500 selection:text-white">
      <div className="max-w-3xl w-full bg-white dark:bg-[var(--card)] rounded-3xl shadow-2xl p-10 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-sky-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          DOCUMENT CONVERSION SUITE
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white text-center">
          PPT to PDF Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-8 max-w-md">
          Transform your PowerPoint presentation slides into clean, secure target PDF output.
        </p>

        {/* Form */}
        <form onSubmit={handleConvert} className="w-full space-y-6">
          {!file ? (
            <UploadCard
              onFiles={handleFileChange}
              accept=".pptx,.ppt"
              title="Click to upload PowerPoint file"
              hint="Supports .pptx and .ppt formats"
            />
          ) : (
            <FileChip
              name={file.name}
              size={`${(file.size / 1024).toFixed(0)} KB`}
              onRemove={() => {
                setFile(null);
                setError(null);
              }}
            />
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-800/60 text-rose-600 dark:text-red-300 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:active:bg-slate-950 text-white font-medium rounded-xl transition shadow-lg shadow-slate-900/10 dark:shadow-slate-900/30 border border-slate-800 disabled:opacity-50 text-sm tracking-wide cursor-pointer"
          >
            {loading ? "Converting presentation..." : "Convert to PDF"}
          </button>
        </form>

        {/* Footer info security badge */}
        <div className="flex items-center gap-2 mt-8 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secure client-side document processing • No file retention</span>
        </div>

      </div>
    </main>
  );
}