"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X, Unlock, Download, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";
import { UploadCard } from "@/components/tools/upload-card";

export default function UnlockPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string; rawFile: File } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") return;
        
        setFile({ name: f.name, size: formatSize(f.size), rawFile: f });
        setDone(false);
        setError("");
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a PDF file.");
            return;
        }
        if (!password) {
            setError("Please enter the document password.");
            return;
        }

        setProcessing(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file.rawFile);
        formData.append("password", password);

        try {
            const res = await fetch("/api/unlock-pdf", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to unlock PDF.");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${file.name.replace(/\.[^/.]+$/, "")}-unlocked.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setDone(true);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-fg flex flex-col items-center justify-center p-6 transition-colors">
            {!file ? (
                <div className="max-w-4xl mx-auto w-full bg-card border border-card rounded-3xl p-12 shadow-2xl transition-colors">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-cyan-950/60 border border-purple-200 dark:border-cyan-800/40 text-purple-900 dark:text-cyan-400 text-xs font-semibold mb-4 shadow-sm">
                            <Sparkles size={13} />
                            DOCUMENT CONVERSION SUITE
                        </div>
                        <h1 className="text-3xl font-bold text-fg tracking-tight mb-2">Unlock PDF</h1>
                        <p className="text-muted text-sm">Remove password protection from your secure PDF documents easily.</p>
                    </div>

                    <UploadCard
                        onFiles={handleFile}
                        title="Click to upload PDF document"
                        hint="Supports text documents and reports"
                        note={
                            <>
                                <ShieldCheck size={14} className="text-[var(--primary)]" />
                                <span>Secure PDF processing • No file retention</span>
                            </>
                        }
                    />
                </div>
            ) : (
                <div className="max-w-2xl mx-auto w-full bg-card border border-card rounded-3xl p-8 shadow-2xl space-y-6 transition-colors">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-cyan-950/60 border border-purple-200 dark:border-cyan-800/40 text-purple-900 dark:text-cyan-400 text-xs font-semibold mb-2 shadow-sm">
                            <Sparkles size={13} />
                            DOCUMENT CONVERSION SUITE
                        </div>
                        <h1 className="text-2xl font-bold text-fg">Unlock PDF</h1>
                        <p className="text-muted text-sm">Enter the document password to remove protection.</p>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-6">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-card">
                            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-cyan-500/10 text-purple-900 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-cyan-500/20">
                                <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-fg text-sm truncate font-medium">{file.name}</p>
                                <p className="text-muted text-xs">{file.size}</p>
                            </div>
                            <button type="button" onClick={() => { setFile(null); setDone(false); setError(""); }} className="text-slate-400 hover:text-purple-900 dark:hover:text-cyan-400 shrink-0">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-5 rounded-2xl bg-background border border-card space-y-4">
                            <label className="text-xs text-muted block mb-1 font-medium uppercase tracking-wider">Document Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    placeholder="Enter current password"
                                    className="w-full px-3 py-2.5 pr-12 rounded-xl border border-card bg-card text-fg text-sm focus:outline-none focus:border-purple-900 dark:focus:border-cyan-500"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-900 dark:hover:text-cyan-400">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="text-center pt-2">
                            <button
                                type="submit"
                                disabled={processing || !file || !password}
                                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 dark:bg-[var(--card)] border border-slate-900 dark:border-slate-700/80 text-white font-semibold hover:bg-slate-800 dark:hover:bg-[var(--card)] transition-all disabled:opacity-50 text-sm tracking-wide shadow-lg flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    "Unlocking PDF..."
                                ) : done ? (
                                    <>
                                        <Download size={18} />
                                        Download Unlocked PDF Again
                                    </>
                                ) : (
                                    "Unlock and Download PDF"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center space-x-2 text-xs text-muted pt-2 border-t border-card">
                        <ShieldCheck size={16} className="text-purple-900 dark:text-cyan-400" />
                        <span>Secure processing • Password decryption verified safely</span>
                    </div>
                </div>
            )}
        </div>
    );
}