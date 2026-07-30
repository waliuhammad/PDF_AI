"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Download, FileSignature } from "lucide-react";

export default function SignPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<"type" | "draw">("type");
    const [signatureText, setSignatureText] = useState("");
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
    };

    const handleSign = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <FileSignature className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Sign PDF</h1>
                <p className="text-muted text-sm mt-1">Add your signature to a PDF document.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-white"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse</p>
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
                        <button onClick={() => { setFile(null); setDone(false); }} className="text-muted hover:text-[var(--primary)] shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Page preview with signature placed bottom-right */}
                    <div className="mt-6 relative rounded-2xl border border-card bg-white p-6 h-64 overflow-hidden">
                        <div className="space-y-2">
                            <div className="h-2.5 w-4/5 rounded bg-[var(--background-secondary)]" />
                            <div className="h-2.5 w-full rounded bg-[var(--background-secondary)]" />
                            <div className="h-2.5 w-3/5 rounded bg-[var(--background-secondary)]" />
                        </div>
                        <div className="absolute bottom-5 right-6 flex flex-col items-end">
                            <span
                                className="text-2xl text-[var(--primary)] select-none"
                                style={{ fontFamily: "cursive" }}
                            >
                                {signatureText || "Your Signature"}
                            </span>
                            <span className="w-40 border-t border-card mt-1" />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="mt-6 p-5 rounded-2xl bg-white border border-card space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode("type")}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "type" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-muted"
                                    }`}
                            >
                                Type
                            </button>
                            <button
                                onClick={() => setMode("draw")}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "draw" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-muted"
                                    }`}
                            >
                                Draw
                            </button>
                        </div>

                        {mode === "type" ? (
                            <div>
                                <label className="text-xs text-muted block mb-1">Your name</label>
                                <input
                                    type="text"
                                    value={signatureText}
                                    onChange={(e) => setSignatureText(e.target.value)}
                                    placeholder="e.g. Wali Muhammad"
                                    className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-white focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>
                        ) : (
                            <div className="h-28 rounded-lg border-2 border-dashed border-card flex items-center justify-center text-muted text-xs">
                                Draw your signature here
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleSign}
                                disabled={processing || (mode === "type" && !signatureText)}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Signing..." : "Sign PDF"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Signed PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}