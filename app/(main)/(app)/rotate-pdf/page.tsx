"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, RotateCw, RotateCcw, Download } from "lucide-react";

export default function RotatePdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") return;
        setFile({ name: f.name, size: formatSize(f.size) });
        setDone(false);
        setRotation(0);
    };

    const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
    const rotateRight = () => setRotation((r) => (r + 90) % 360);

    const handleApply = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <RotateCw className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Rotate PDF</h1>
                <p className="text-muted text-sm mt-1">Rotate every page of your PDF to the orientation you need.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse</p>
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
                        <button onClick={() => { setFile(null); setDone(false); }} className="text-muted hover:text-[var(--primary)] shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Rotation preview */}
                    <div className="mt-6 rounded-2xl border border-card bg-card p-10 flex items-center justify-center h-56">
                        <div
                            className="w-28 h-36 rounded-md border-2 border-[var(--primary)] bg-red-50 flex items-center justify-center transition-transform duration-300"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            <FileText className="text-[var(--primary)]" size={28} />
                        </div>
                    </div>

                    {/* Rotate controls */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                            onClick={rotateLeft}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-card text-fg text-sm hover:border-[var(--primary)] transition-colors"
                        >
                            <RotateCcw size={16} />
                            Rotate Left
                        </button>
                        <button
                            onClick={rotateRight}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-card text-fg text-sm hover:border-[var(--primary)] transition-colors"
                        >
                            <RotateCw size={16} />
                            Rotate Right
                        </button>
                    </div>
                    <p className="text-center text-muted text-xs mt-2">Current rotation: {rotation}°</p>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleApply}
                                disabled={processing || rotation === 0}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Rotating..." : "Apply Rotation"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Rotated PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}