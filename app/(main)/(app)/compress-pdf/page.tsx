"use client";

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
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-white"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={26} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or tap to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-card">
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
                                        className={`w-full text-left p-4 rounded-xl border transition-colors ${level === l.id ? "border-[var(--primary)] bg-red-50" : "border-card bg-white"
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
                            <div className="rounded-xl border border-card bg-white p-4 sm:p-6">
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
}