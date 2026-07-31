"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Unlock, Download, Eye, EyeOff } from "lucide-react";

// TEMP (frontend-only stage): mock password to demo success/error states.
// Replace with real backend password verification once the API is ready.
const MOCK_CORRECT_PASSWORD = "demo1234";

export default function UnlockPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(false);
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
        setError(false);
    };

    const handleUnlock = () => {
        setProcessing(true);
        setError(false);
        setTimeout(() => {
            setProcessing(false);
            if (password === MOCK_CORRECT_PASSWORD) {
                setDone(true);
            } else {
                setError(true);
                setDone(false);
            }
        }, 1800);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <Unlock className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Unlock PDF</h1>
                <p className="text-muted text-sm mt-1">Remove the password from a PDF you have access to.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card "
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a protected PDF file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card  border border-card">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-fg text-sm truncate">{file.name}</p>
                            <p className="text-muted text-xs">{file.size}</p>
                        </div>
                        <button onClick={() => { setFile(null); setDone(false); setError(false); }} className="text-muted hover:text-[var(--primary)] shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="mt-6 p-5 rounded-2xl bg-card  border border-card">
                        <label className="text-xs text-muted block mb-1">Current password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                placeholder="Enter the PDF's password"
                                className={`w-full px-3 py-2 pr-10 rounded-lg border text-fg text-sm bg-card  focus:outline-none ${error ? "border-[var(--primary)]" : "border-card focus:border-[var(--primary)]"
                                    }`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {error && <p className="text-xs text-[var(--primary)] mt-1">Incorrect password. Please try again.</p>}
                    </div>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleUnlock}
                                disabled={processing || !password}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Unlocking..." : "Unlock PDF"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Unlocked PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}