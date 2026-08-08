"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X, FileArchive, Download, Loader2, CheckCircle2 } from "lucide-react";
// aliased: this component already has state called errorMessage, which would
// shadow the import and turn the call below into calling a string.
import { errorMessage as messageFrom } from "@/lib/errors";

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
    } catch (err) {
      setErrorMessage(messageFrom(err, "An error occurred while connecting to the server."));
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
    <div className="max-w-5xl mx-auto w-full px-4">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-card border border-card flex items-center justify-center mb-3 text-fg">
          <FileArchive size={28} />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-fg tracking-tight">Compress PDF</h1>
        <p className="text-slate-600 dark:text-[#9ca3af] text-sm mt-1.5 max-w-lg mx-auto">
          Select your target size and compress your PDF while keeping the best possible quality.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files)}
      />

      {!fileDetails ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          // See split-pdf: a bare div with an onClick is unreachable without a
          // mouse, and the input behind it is display:none.
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`cursor-pointer rounded-[32px] p-16 h-[380px] flex flex-col items-center justify-center text-center transition-all bg-[var(--background-secondary)] border border-card shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
            isDragging ? "border-slate-900 dark:border-white scale-[1.01]" : "hover:border-slate-300 dark:hover:border-[#333a4a]"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--background-secondary)] mx-auto flex items-center justify-center mb-4 text-fg shadow-sm border border-card">
            <Upload size={26} />
          </div>
          <p className="text-fg font-semibold text-lg">Click to browse or drag & drop PDFs</p>
          <p className="text-slate-600 dark:text-[#9ca3af] text-sm mt-1">Upload a document to start compression</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card border border-card rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card border border-card flex items-center justify-center shrink-0 text-fg">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-fg text-sm font-bold truncate">{fileDetails.name}</p>
                <p className="text-xs text-slate-600 dark:text-[#9ca3af] mt-0.5">
                  Original Size: <strong className="text-fg">{fileDetails.formattedSize}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFileDetails(null);
                setRawFile(null);
                setDone(false);
                setErrorMessage(null);
              }}
              className="py-1.5 px-3.5 rounded-xl bg-red-950/50 hover:bg-red-900/50 text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <X size={15} /> Remove File
            </button>
          </div>

          <div className="bg-card border border-card rounded-3xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-card">
              <div className="flex items-center gap-2">
                <FileArchive size={18} className="text-fg" />
                <span className="text-sm font-extrabold text-fg">Compression Configuration</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-[#9ca3af] block mb-1.5">
                  Select Compression Level & Target Size
                </label>
                <select
                  value={selectedOption?.targetKB || ""}
                  onChange={(e) => {
                    const opt = options.find((o) => o.targetKB === Number(e.target.value));
                    if (opt) setSelectedOption(opt);
                    setDone(false);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-card border border-card rounded-xl px-3.5 py-3 text-fg text-sm focus:outline-none focus:border-slate-900 dark:border-white cursor-pointer"
                >
                  {options.map((opt) => (
                    <option key={opt.targetKB} value={opt.targetKB} className="bg-card text-fg">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs font-semibold text-center">
                {errorMessage}
              </div>
            )}

            <div className="pt-2">
              {!done ? (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFileDetails(null);
                      setRawFile(null);
                      setDone(false);
                      setErrorMessage(null);
                    }}
                    className="py-3 px-6 rounded-2xl border border-card text-slate-600 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-fg font-bold text-xs transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={executeCompress}
                    disabled={processing}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-sm shadow-lg disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all hover:bg-zinc-200"
                  >
                    {processing ? <Loader2 className="animate-spin" size={18} /> : <FileArchive size={18} />}
                    {processing ? "Compressing PDF..." : "Compress PDF"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                    <CheckCircle2 size={18} />
                    <span>PDF Compressed Successfully!</span>
                  </div>

                  {compressedSize && (
                    <p className="text-sm text-slate-600 dark:text-[#9ca3af]">
                      Size reduced from <strong className="text-fg">{fileDetails.formattedSize}</strong> to{" "}
                      <strong className="text-fg">{formatSize(compressedSize)}</strong>
                      {calculateSavings() > 0 && (
                        <span className="ml-2.5 px-2.5 py-0.5 rounded-full text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800 font-bold inline-block">
                          -{calculateSavings()}%
                        </span>
                      )}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setDone(false)}
                      className="py-3 px-6 rounded-2xl border border-card text-slate-600 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-fg font-bold text-xs transition-colors"
                    >
                      Compress Again
                    </button>
                    <button
                      type="button"
                      onClick={executeCompress}
                      disabled={processing}
                      className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-sm shadow-lg disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all hover:bg-zinc-200"
                    >
                      {processing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      {processing ? "Downloading..." : "Download Compressed PDF"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}