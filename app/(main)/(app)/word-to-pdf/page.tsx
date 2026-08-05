"use client";

import React, { useState, useRef } from "react";
import { FileText, X, Upload, Loader2 } from "lucide-react";

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
 <div className="text-slate-900 dark:text-slate-100 flex flex-col items-center transition-colors">
      <div className="max-w-5xl mx-auto w-full bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl transition-colors">
        <div className="text-center mb-8 lg:mb-10">
          <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-cyan-950/60 border border-purple-200 dark:border-cyan-800/40 flex items-center justify-center mb-4">
            <FileText className="text-purple-900 dark:text-cyan-400" size={24} />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Convert Word to PDF</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Transform your Word documents into professional, secure PDF files instantly.</p>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors bg-slate-50 dark:bg-[#0b0f19] border-slate-300 dark:border-slate-800/80 hover:border-purple-900 dark:hover:border-cyan-500/50 ${
              isDragging ? "border-purple-900 bg-purple-100 dark:border-cyan-500 dark:bg-cyan-500/5" : ""
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 dark:bg-cyan-500/10 border border-purple-200 dark:border-cyan-500/20 flex items-center justify-center mb-3 text-purple-900 dark:text-cyan-400">
              <Upload size={22} />
            </div>
            <p className="text-slate-900 dark:text-white font-medium text-sm">Click to upload or drag & drop</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">DOCX and DOC documents</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-cyan-500/10 border border-purple-200 dark:border-cyan-500/20 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-purple-900 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white text-sm truncate">{file.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{formatSize(file.size)}</p>
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-[#0d1322] border border-slate-900 dark:border-slate-700/80 hover:bg-slate-800 dark:hover:bg-[#111827] text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto text-sm shadow-lg"
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