"use client";

import React, { useState } from "react";
import { FileText, X, Loader2 } from "lucide-react";
import { UploadCard } from "@/components/tools/upload-card";

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const selectedFile = fileList[0];
    if (
      selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      selectedFile.type === "application/msword" ||
      selectedFile.name.endsWith(".docx") ||
      selectedFile.name.endsWith(".doc")
    ) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid Word document (.docx or .doc).");
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/word-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Conversion failed.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Fallback if response is not json
        }
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}_converted.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during conversion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-fg flex flex-col items-center justify-center p-6 transition-colors">
      <div className="max-w-3xl mx-auto w-full bg-card border border-card rounded-3xl p-8 sm:p-12 shadow-2xl transition-colors">
        <div className="text-center mb-8 lg:mb-10">
          <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-cyan-950/60 border border-purple-200 dark:border-cyan-800/40 flex items-center justify-center mb-4">
            <FileText className="text-purple-900 dark:text-cyan-400" size={24} />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-fg tracking-tight">Convert Word to PDF</h1>
          <p className="text-muted text-sm mt-1">Transform your Word documents into professional, secure PDF files instantly.</p>
        </div>

        {!file ? (
          <UploadCard
            onFiles={handleFileChange}
            accept=".doc,.docx"
            title="Click to upload or drag & drop"
            hint="DOCX and DOC documents"
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-card">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-cyan-500/10 border border-purple-200 dark:border-cyan-500/20 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-purple-900 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-fg text-sm truncate">{file.name}</p>
                <p className="text-muted text-xs">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => { setFile(null); setError(null); }}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 p-1"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={handleConvert}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-[var(--card)] border border-slate-900 dark:border-slate-700/80 hover:bg-slate-800 dark:hover:bg-[var(--card)] text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto text-sm shadow-lg"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? "Converting..." : "Convert to PDF (.pdf)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}