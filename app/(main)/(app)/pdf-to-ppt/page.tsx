"use client";

import React, { useState, useRef, JSX } from "react";
import { FileText, Trash2, Download, UploadCloud, ShieldCheck, Sparkles, Presentation } from "lucide-react";

export default function PdfToPpt(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.includes("pdf")) {
      setError("Please upload a valid PDF document (.pdf).");
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setSuccess(false);
    setDownloadUrl(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/pdf-to-ppt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while converting the PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFile(null);
    setSuccess(false);
    setError(null);
    setDownloadUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = (): void => {
    if (!downloadUrl || !file) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}-converted.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col items-center justify-center p-6 antialiased selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl w-full space-y-8 bg-[#121824] border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Conversion Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">PDF to PowerPoint Converter</h1>
          <p className="text-sm text-slate-400">
            Transform pages from your PDF documents directly into styled PowerPoint presentation slides (.pptx).
          </p>
        </div>

        {!file && (
          <label className="group relative border-2 border-dashed border-slate-700/70 hover:border-blue-500/85 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-[#182030]/50 hover:bg-[#182030] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-200 text-base mb-1">Click to upload PDF document</span>
            <span className="text-xs text-slate-400">Supports text documents and reports</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#182030] border border-slate-700/60 p-4 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[220px]">{file.name}</h3>
                  <span className="text-[11px] text-slate-400">Ready for slide generation</span>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="inline-flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/20 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove File</span>
              </button>
            </div>

            {loading && (
              <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
                Parsing PDF layout and creating PowerPoint presentation slides...
              </div>
            )}

            {success && (
              <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <Presentation className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">Presentation Ready!</h3>
                <p className="text-xs text-slate-400">Your PowerPoint slides have been compiled successfully.</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {success && downloadUrl && (
          <button
            onClick={handleDownload}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download PowerPoint (.pptx)</span>
          </button>
        )}

        <div className="pt-2 flex items-center justify-center space-x-1.5 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secure PDF presentation conversion • No file retention</span>
        </div>

      </div>
    </div>
  );
}