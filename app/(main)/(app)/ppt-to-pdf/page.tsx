"use client";

<<<<<<< HEAD
import { useState, useRef } from "react";
import { Upload, Presentation, X, Download } from "lucide-react";

export default function PptToPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isPptFile = (f: File) =>
        f.name.endsWith(".ppt") || f.name.endsWith(".pptx") ||
        f.type === "application/vnd.ms-powerpoint" ||
        f.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation";

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (!isPptFile(f)) return;
        setFile({ name: f.name, size: formatSize(f.size) });
        setDone(false);
    };

    const handleConvert = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 2000);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-tint flex items-center justify-center mb-4">
                    <Presentation className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">PowerPoint to PDF</h1>
                <p className="text-muted text-sm mt-1">Convert your presentation into a PDF file.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-primary-tint" : "border-card bg-card"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        hidden
                        onChange={(e) => handleFile(e.target.files)}
                    />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PowerPoint file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse — .ppt or .pptx</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
                        <div className="w-9 h-9 rounded-lg bg-primary-tint flex items-center justify-center shrink-0">
                            <Presentation size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-fg text-sm truncate">{file.name}</p>
                            <p className="text-muted text-xs">{file.size}</p>
                        </div>
                        <button onClick={() => { setFile(null); setDone(false); }} className="text-muted hover:text-[var(--primary)] shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleConvert}
                                disabled={processing}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Converting..." : "Convert to PDF"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
=======
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
>>>>>>> 0635d89 ( commit message here)
}