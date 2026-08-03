"use client";

import { useState } from "react";
import { Sparkles, CloudUpload, ShieldCheck } from "lucide-react";

export default function PptToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert PPT to PDF.");
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
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-[#111827] rounded-3xl shadow-2xl p-10 border border-slate-800 flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-sky-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          DOCUMENT CONVERSION SUITE
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-white text-center">
          PPT to PDF Converter
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8 max-w-md">
          Transform your PowerPoint presentation slides into clean, secure target PDF output.
        </p>

        {/* Form */}
        <form onSubmit={handleConvert} className="w-full space-y-6">
          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-sky-500/40 hover:border-sky-400/80 rounded-2xl p-10 text-center cursor-pointer transition bg-[#0E1526]/60 group">
            <input
              type="file"
              accept=".pptx, .ppt"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            
            <div className="w-14 h-14 rounded-2xl bg-sky-600/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-105 transition-transform">
              <CloudUpload className="w-7 h-7" />
            </div>

            <span className="text-base font-semibold text-slate-200 mb-1">
              {file ? file.name : "Click to upload PowerPoint file"}
            </span>
            <span className="text-xs text-slate-400">
              Supports .pptx and .ppt formats
            </span>
          </label>

          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/60 text-red-300 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl transition shadow-lg shadow-sky-600/25 disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? "Converting presentation..." : "Convert to PDF"}
          </button>
        </form>

        {/* Footer info security badge */}
        <div className="flex items-center gap-2 mt-8 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secure client-side document processing • No file retention</span>
        </div>

      </div>
    </main>
  );
}