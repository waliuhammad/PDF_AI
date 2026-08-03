"use client";

<<<<<<< HEAD
import React, { useState, useRef } from "react";
import { Upload, FileText, X, Minimize2, Download, TrendingDown } from "lucide-react";
import { compressPdf, type CompressionLevel } from "@/lib/api";

export default function CompressPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string; bytes: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [level, setLevel] = useState<CompressionLevel>("recommended");
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ compressedBytes: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") return;
        setFile({ name: f.name, size: formatSize(f.size), bytes: f.size });
        setResult(null);
    };

    const handleCompress = async () => {
        if (!file) return;
        setProcessing(true);
        const res = await compressPdf(file.bytes, level);
        setResult({ compressedBytes: res.compressedBytes });
        setProcessing(false);
    };

    const levels = [
        { id: "low" as const, label: "Low compression", desc: "Best quality, smaller size reduction" },
        { id: "recommended" as const, label: "Recommended", desc: "Good balance of quality and size" },
        { id: "extreme" as const, label: "Extreme compression", desc: "Smallest size, lower quality" },
    ];

    const reductionEstimate: Record<CompressionLevel, number> = {
        low: 0.15,
        recommended: 0.45,
        extreme: 0.7,
    };

    const estimatedSize = file ? file.bytes * (1 - reductionEstimate[level]) : 0;
    const actualReductionPct = result && file ? Math.round((1 - result.compressedBytes / file.bytes) * 100) : 0;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-0">
            <div className="text-center mb-8 sm:mb-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <Minimize2 className="text-[var(--primary)]" size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-fg">Compress PDF</h1>
                <p className="text-muted text-sm mt-1 px-2 sm:px-0">
                    Reduce your PDF's file size while keeping the best possible quality.
                </p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={26} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or tap to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-fg text-sm truncate">{file.name}</p>
                            <p className="text-muted text-xs">{file.size}</p>
                        </div>
                        <button
                            onClick={() => { setFile(null); setResult(null); }}
                            className="text-muted hover:text-[var(--primary)] shrink-0 p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {!result && (
                        <>
                            <div className="mt-6 space-y-3">
                                {levels.map((l) => (
                                    <button
                                        key={l.id}
                                        onClick={() => setLevel(l.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-colors ${level === l.id ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-fg font-medium text-sm">{l.label}</p>
                                                <p className="text-muted text-xs mt-0.5">{l.desc}</p>
                                            </div>
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 shrink-0 ${level === l.id ? "border-[var(--primary)] bg-[var(--primary)]" : "border-card"
                                                    }`}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 text-center text-xs sm:text-sm text-muted">
                                Estimated size: <span className="text-fg font-medium">{formatSize(estimatedSize)}</span>{" "}
                                <span className="text-[var(--primary)]">(-{Math.round(reductionEstimate[level] * 100)}%)</span>
                            </div>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleCompress}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                                >
                                    {processing ? "Compressing..." : "Compress PDF"}
                                </button>
                            </div>
                        </>
                    )}

                    {result && (
                        <div className="mt-6">
                            <div className="rounded-xl border border-card bg-card p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                        <TrendingDown className="text-green-600" size={16} />
                                    </div>
                                    <p className="text-sm font-medium text-fg">Compression complete</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="rounded-lg bg-bg p-3 sm:p-4 text-center">
                                        <p className="text-xs text-muted mb-1">Original size</p>
                                        <p className="text-base sm:text-lg font-semibold text-fg">{file.size}</p>
                                    </div>
                                    <div className="rounded-lg bg-bg p-3 sm:p-4 text-center">
                                        <p className="text-xs text-muted mb-1">New size</p>
                                        <p className="text-base sm:text-lg font-semibold text-fg">{formatSize(result.compressedBytes)}</p>
                                    </div>
                                    <div className="rounded-lg bg-red-50 p-3 sm:p-4 text-center">
                                        <p className="text-xs text-[var(--primary)] mb-1">Reduced by</p>
                                        <p className="text-base sm:text-lg font-semibold text-[var(--primary)]">{actualReductionPct}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                    <Download size={18} />
                                    Download Compressed PDF
                                </button>
                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full border border-card text-fg font-medium hover:bg-bg transition-colors"
                                >
                                    Try Another Level
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
=======
import { useState, useRef } from "react";
import { Upload, FileText, X, FileArchive, Download, Loader2, CheckCircle2 } from "lucide-react";

interface TargetOption {
  label: string;
  targetKB: number;
  ratio: number;
}

export default function CompressPdfPage() {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number; formattedSize: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [options, setOptions] = useState<TargetOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<TargetOption | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const generateOptions = (fileSizeBytes: number): TargetOption[] => {
    const fileSizeKB = fileSizeBytes / 1024;
    
    const percentages = [
      { label: "Extreme Compression (~75% reduction)", ratio: 0.25 },
      { label: "High Compression (~60% reduction)", ratio: 0.40 },
      { label: "Medium Compression (~45% reduction)", ratio: 0.55 },
      { label: "Recommended Compression (~30% reduction)", ratio: 0.70 },
      { label: "Low Compression (~15% reduction)", ratio: 0.85 },
      { label: "Minimal Compression (~5% reduction)", ratio: 0.95 },
    ];

    return percentages.map((p) => {
      const targetKB = Math.round(fileSizeKB * p.ratio);
      return {
        label: `${p.label} - Target: ~${targetKB < 1024 ? `${targetKB} KB` : `${(targetKB / 1024).toFixed(1)} MB`}`,
        targetKB,
        ratio: p.ratio,
      };
    });
  };

  const handleFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF file.");
      return;
    }

    const fileOptions = generateOptions(f.size);

    setRawFile(f);
    setFileDetails({
      name: f.name,
      size: f.size,
      formattedSize: formatSize(f.size),
    });
    setOptions(fileOptions);
    setSelectedOption(fileOptions[2]); // Default to Medium Compression
    setDone(false);
    setCompressedSize(null);
    setErrorMessage(null);
  };

  const executeCompress = async () => {
    if (!rawFile || !selectedOption) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", rawFile);
      formData.append("targetSizeKB", String(selectedOption.targetKB));
      formData.append("targetRatio", String(selectedOption.ratio));

      const response = await fetch("/api/compress-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to compress PDF.");
      }

      const blob = await response.blob();
      setCompressedSize(blob.size);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed_${rawFile.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDone(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while connecting to the server.");
    } finally {
      setProcessing(false);
    }
  };

  const calculateSavings = () => {
    if (!fileDetails || !compressedSize) return 0;
    const diff = fileDetails.size - compressedSize;
    if (diff <= 0) return 0;
    return Math.round((diff / fileDetails.size) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      <div className="text-center mb-8 lg:mb-10">
        <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <FileArchive className="text-blue-400" size={24} />
        </div>
        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Compress PDF</h1>
        <p className="text-slate-400 text-sm mt-1">Select your target size and compress your PDF.</p>
      </div>

      {!fileDetails ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors bg-[#111827] border-slate-800/80 hover:border-blue-500/50 ${
            isDragging ? "border-blue-500 bg-blue-500/5" : ""
          }`}
        >
          <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 text-blue-400">
            <Upload size={22} />
          </div>
          <p className="text-white font-medium text-sm">Drag & drop a PDF file here</p>
          <p className="text-slate-400 text-xs mt-1">or click to browse</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-slate-800/80">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{fileDetails.name}</p>
              <p className="text-slate-400 text-xs">Original Size: <span className="font-semibold text-white">{fileDetails.formattedSize}</span></p>
            </div>
            <button
              onClick={() => { setFileDetails(null); setRawFile(null); setDone(false); setErrorMessage(null); }}
              className="text-slate-400 hover:text-white shrink-0 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800/80 space-y-4">
            <label className="text-sm font-medium text-white block">Select Compression Level & Target Size</label>
            <p className="text-xs text-slate-400 mb-2">Choose from 6 target sizes generated for your PDF:</p>

            <select
              value={selectedOption?.targetKB || ""}
              onChange={(e) => {
                const opt = options.find((o) => o.targetKB === Number(e.target.value));
                if (opt) setSelectedOption(opt);
                setDone(false);
                setErrorMessage(null);
              }}
              className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              {options.map((opt) => (
                <option key={opt.targetKB} value={opt.targetKB} className="bg-[#0d1322] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          <div className="text-center pt-2">
            {!done ? (
              <button
                onClick={executeCompress}
                disabled={processing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto text-sm"
              >
                {processing && <Loader2 className="animate-spin" size={18} />}
                {processing ? "Compressing..." : "Compress PDF"}
              </button>
            ) : (
              <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-base">
                  <CheckCircle2 size={20} />
                  <span>PDF Compressed Successfully!</span>
                </div>
                {compressedSize && (
                  <p className="text-xs sm:text-sm text-slate-300">
                    Size reduced from <span className="font-semibold text-white">{fileDetails.formattedSize}</span> to{" "}
                    <span className="font-semibold text-white">{formatSize(compressedSize)}</span>
                    {calculateSavings() > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-block">
                        -{calculateSavings()}%
                      </span>
                    )}
                  </p>
                )}
                <div className="pt-2">
                  <button
                    onClick={executeCompress}
                    disabled={processing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 text-sm"
                  >
                    {processing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    Download Compressed PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}