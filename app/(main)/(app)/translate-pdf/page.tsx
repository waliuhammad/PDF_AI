"use client";

import { useState } from "react";
import { Languages, Copy, Download, Loader2 } from "lucide-react";
import { AiError, TRANSLATE_LANGUAGES, translateDocument } from "@/lib/ai";
import { ErrorNote, FileDrop, RunButton, SelectedFile, ToolShell } from "@/components/tools/tool-shell";

export default function TranslatePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState<string>("Spanish");
    const [result, setResult] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFile = (f: File) => {
        if (f.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        setFile(f);
        setResult("");
        setError(null);
    };

    const handleTranslate = async () => {
        if (!file) return;

        setRunning(true);
        setError(null);
        try {
            setResult(await translateDocument(file, language));
        } catch (err) {
            setError(err instanceof AiError ? err.message : "Couldn't translate that document.");
        } finally {
            setRunning(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleDownload = () => {
        const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file?.name.replace(/\.[^/.]+$/, "") ?? "document"}-${language}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <ToolShell
            icon={Languages}
            title="Translate PDF"
            description="Translate a document into another language, keeping its structure."
        >
            {!file ? (
                <FileDrop onFile={handleFile} />
            ) : (
                <>
                    <SelectedFile
                        name={file.name}
                        size={file.size}
                        disabled={running}
                        onClear={() => { setFile(null); setResult(""); setError(null); }}
                    />

                    <div className="mt-6 p-5 rounded-2xl bg-card border border-card">
                        <label htmlFor="language" className="block text-sm font-medium text-fg mb-1.5">
                            Translate into
                        </label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={running}
                            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-card bg-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-60"
                        >
                            {TRANSLATE_LANGUAGES.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    {error && <ErrorNote>{error}</ErrorNote>}

                    {result && (
                        <div className="mt-6 p-5 rounded-2xl bg-card border border-card">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-fg font-semibold text-sm flex items-center gap-2">
                                    <Languages size={14} className="text-[var(--primary)]" />
                                    {language} translation
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button onClick={handleCopy} className="text-muted hover:text-[var(--primary)] flex items-center gap-1 text-xs">
                                        <Copy size={13} />
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                    <button onClick={handleDownload} className="text-muted hover:text-[var(--primary)] flex items-center gap-1 text-xs">
                                        <Download size={13} />
                                        .txt
                                    </button>
                                </div>
                            </div>
                            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm text-fg leading-relaxed font-sans">
                                {result}
                            </pre>
                        </div>
                    )}

                    <RunButton
                        running={running}
                        onClick={handleTranslate}
                        label={result ? "Translate again" : "Translate"}
                        runningLabel="Translating..."
                    />
                    {running && (
                        <p className="text-center text-xs text-muted mt-3 flex items-center justify-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" />
                            Long documents can take a minute.
                        </p>
                    )}
                </>
            )}
        </ToolShell>
    );
}
