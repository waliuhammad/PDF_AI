"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Download, Image as ImageIcon, Check } from "lucide-react";
import { convertPdfToImages, type ImageFormat } from "@/lib/api";

const FORMATS: { id: ImageFormat; label: string; desc: string }[] = [
    { id: "jpg", label: "JPG", desc: "Smaller size, best for photos" },
    { id: "png", label: "PNG", desc: "Lossless, supports transparency" },
    { id: "svg", label: "SVG", desc: "Vector, scales without quality loss" },
    { id: "webp", label: "WEBP", desc: "Modern format, small file size" },
];

export default function PdfToImagePage() {
    const [file, setFile] = useState<{ name: string; size: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [format, setFormat] = useState<ImageFormat>("jpg");
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ imageCount: number; format: ImageFormat } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") return;
        setFile({ name: f.name, size: f.size });
        setResult(null);
    };

    const handleConvert = async () => {
        if (!file) return;
        setProcessing(true);
        const res = await convertPdfToImages({ name: file.name, size: file.size }, format);
        setResult({ imageCount: res.imageCount, format: res.format });
        setProcessing(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-0">
            <div className="text-center mb-8 sm:mb-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <ImageIcon className="text-[var(--primary)]" size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-fg">PDF to Image</h1>
                <p className="text-muted text-sm mt-1 px-2 sm:px-0">Convert each page of your PDF into an image file.</p>
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
                            <p className="text-muted text-xs">{formatSize(file.size)}</p>
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
                            {/* Output format — radio selection */}
                            <div className="mt-6">
                                <p className="text-xs text-muted mb-3">Convert to</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {FORMATS.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFormat(f.id)}
                                            className={`text-left p-3 sm:p-4 rounded-xl border transition-colors ${format === f.id ? "border-[var(--primary)] bg-red-50" : "border-card bg-white"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-fg">{f.label}</span>
                                                <span
                                                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${format === f.id ? "border-[var(--primary)] bg-[var(--primary)]" : "border-card"
                                                        }`}
                                                >
                                                    {format === f.id && <Check size={10} className="text-white" />}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted leading-snug">{f.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleConvert}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                                >
                                    {processing ? "Converting..." : `Convert to ${format.toUpperCase()}`}
                                </button>
                            </div>
                        </>
                    )}

                    {result && (
                        <div className="mt-6 text-center">
                            <div className="rounded-xl border border-card bg-white p-4 sm:p-6 mb-6">
                                <p className="text-sm text-fg">
                                    <span className="font-semibold">{result.imageCount}</span> pages converted to{" "}
                                    <span className="font-semibold uppercase">{result.format}</span>
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                    <Download size={18} />
                                    Download Images (ZIP)
                                </button>
                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full border border-card text-fg font-medium hover:bg-bg transition-colors"
                                >
                                    Try Another Format
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}