"use client";

import { useState} from "react";
import { UploadCard } from "@/components/tools/upload-card";
import { CheckCheck, Sparkles, Copy, Loader2, FileText, X, ArrowRight } from "lucide-react";
import { errorMessage } from "@/lib/errors";

export default function GrammarCheckerPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileMeta, setFileMeta] = useState<{ name: string; size: string } | null>(null);
    const [correctedText, setCorrectedText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") {
            setError("Please upload a valid PDF document.");
            return;
        }
        setError(null);
        setSelectedFile(f);
        setFileMeta({ name: f.name, size: formatSize(f.size) });
        setCorrectedText(null);
    };

    const handleCheckGrammar = async () => {
        if (!selectedFile || loading) return;

        setLoading(true);
        setError(null);
        setCorrectedText(null);

        try {
            const formData = new FormData();
formData.append("file", selectedFile);

const res = await fetch("/api/grammar", {
    method: "POST",
    body: formData,
});

const data = await res.json();

if (!res.ok) {
    throw new Error(
        data.message || "Failed to process document grammar correction."
    );
}

            const result = data.correctedText || data.reply || data.response || data.message || JSON.stringify(data);
            setCorrectedText(result);
        } catch (err) {
            setError(errorMessage(err, "Something went wrong connecting to the server."));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!correctedText) return;
        navigator.clipboard.writeText(correctedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900/30 flex items-center justify-center mb-4 border border-purple-500/20">
                    <CheckCheck className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">PDF Grammar Checker</h1>
                <p className="text-muted text-sm mt-1">Upload a PDF document to check and correct grammar and spelling automatically.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Panel */}
                <div className="flex flex-col rounded-2xl bg-card border border-card p-4">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Upload Document
                    </label>

                    {!fileMeta ? (
                        <UploadCard
                            onFiles={handleFile}
                            title={"Drag & drop your PDF here"}
                            hint={"or click to browse files"}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                                <div className="w-9 h-9 rounded-lg bg-purple-900/30 flex items-center justify-center shrink-0">
                                    <FileText size={16} className="text-[var(--primary)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-fg text-sm truncate">{fileMeta.name}</p>
                                    <p className="text-muted text-xs">{fileMeta.size}</p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedFile(null); setFileMeta(null); setCorrectedText(null); setError(null); }} 
                                    className="text-muted hover:text-[var(--primary)] shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="mt-4 text-center text-xs text-muted">
                                PDF ready for syntax & grammar scanning.
                            </div>
                        </div>
                    )}

                    <div className="pt-3 border-t border-white/5 mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={handleCheckGrammar}
                            disabled={loading || !selectedFile}
                            className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-900/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Analyzing PDF...
                                </>
                            ) : (
                                <>
                                    Check Grammar
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="flex flex-col rounded-2xl bg-card border border-card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={13} className="text-[var(--primary)]" />
                            Corrected Result
                        </span>
                        {correctedText && (
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="text-muted hover:text-[var(--primary)] flex items-center gap-1 text-xs"
                            >
                                <Copy size={13} />
                                {copied ? "Copied" : "Copy"}
                            </button>
                        )}
                    </div>
                    <div className="w-full flex-1 rounded-lg bg-black/20 p-4 border border-white/5 overflow-y-auto max-h-[220px]">
                        {correctedText ? (
                            <p className="text-sm text-fg whitespace-pre-wrap leading-relaxed">
                                {correctedText}
                            </p>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center text-muted text-xs">
                                Corrected text output will appear here...
                            </div>
                        )}
                    </div>
                    <div className="pt-3 border-t border-white/5 mt-3 flex justify-end">
                        <span className="text-xs text-muted">Powered by AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
}