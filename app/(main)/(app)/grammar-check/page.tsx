"use client";

import { useState } from "react";
import { SpellCheck, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { AiError, checkGrammar, type GrammarReport } from "@/lib/ai";
import { ErrorNote, FileDrop, RunButton, SelectedFile, ToolShell } from "@/components/tools/tool-shell";

/** Each kind gets its own chip so the list can be scanned by problem type. */
const KIND_STYLES: Record<string, string> = {
    spelling: "bg-red-500/10 text-red-600",
    grammar: "bg-amber-500/10 text-amber-600",
    punctuation: "bg-blue-500/10 text-blue-600",
    style: "bg-[var(--primary)]/10 text-[var(--primary)]",
    clarity: "bg-green-500/10 text-green-600",
};

export default function GrammarCheckPage() {
    const [file, setFile] = useState<File | null>(null);
    const [report, setReport] = useState<GrammarReport | null>(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");

    const handleFile = (f: File) => {
        if (f.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        setFile(f);
        setReport(null);
        setError(null);
        setFilter("all");
    };

    const handleCheck = async () => {
        if (!file) return;

        setRunning(true);
        setError(null);
        try {
            setReport(await checkGrammar(file));
        } catch (err) {
            setError(err instanceof AiError ? err.message : "Couldn't check that document.");
        } finally {
            setRunning(false);
        }
    };

    const kinds = report ? Array.from(new Set(report.issues.map((i) => i.kind))) : [];
    const visible = report
        ? report.issues.filter((i) => filter === "all" || i.kind === filter)
        : [];

    return (
        <ToolShell
            icon={SpellCheck}
            title="AI Grammar Checker"
            description="Find spelling, grammar and phrasing problems across a document."
        >
            {!file ? (
                <FileDrop onFile={handleFile} />
            ) : (
                <>
                    <SelectedFile
                        name={file.name}
                        size={file.size}
                        disabled={running}
                        onClear={() => { setFile(null); setReport(null); setError(null); }}
                    />

                    {error && <ErrorNote>{error}</ErrorNote>}

                    {report && (
                        <div className="mt-6 space-y-4">
                            <div className="p-5 rounded-2xl bg-card border border-card">
                                <h2 className="text-fg font-semibold text-sm flex items-center gap-2 mb-2">
                                    {report.issues.length === 0 ? (
                                        <CheckCircle2 size={14} className="text-green-600" />
                                    ) : (
                                        <SpellCheck size={14} className="text-[var(--primary)]" />
                                    )}
                                    {report.issues.length === 0
                                        ? "Nothing to correct"
                                        : `${report.issues.length} ${report.issues.length === 1 ? "issue" : "issues"} found`}
                                </h2>
                                <p className="text-sm text-muted leading-relaxed">{report.assessment}</p>
                            </div>

                            {report.issues.length > 0 && (
                                <>
                                    {kinds.length > 1 && (
                                        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-card bg-card w-fit">
                                            <button
                                                onClick={() => setFilter("all")}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === "all" ? "bg-[var(--primary)] text-white" : "text-muted hover:text-fg"
                                                    }`}
                                            >
                                                All ({report.issues.length})
                                            </button>
                                            {kinds.map((kind) => (
                                                <button
                                                    key={kind}
                                                    onClick={() => setFilter(kind)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filter === kind ? "bg-[var(--primary)] text-white" : "text-muted hover:text-fg"
                                                        }`}
                                                >
                                                    {kind} ({report.issues.filter((i) => i.kind === kind).length})
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {visible.map((issue, i) => (
                                            <div key={i} className="p-5 rounded-2xl bg-card border border-card">
                                                <span
                                                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize mb-3 ${KIND_STYLES[issue.kind] ?? "bg-[var(--background-secondary)] text-muted"
                                                        }`}
                                                >
                                                    {issue.kind}
                                                </span>

                                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-3">
                                                    <p className="text-sm text-muted line-through decoration-red-500/50 flex-1">
                                                        {issue.excerpt}
                                                    </p>
                                                    <ArrowRight size={15} className="text-muted shrink-0 hidden sm:block mt-0.5" />
                                                    <p className="text-sm text-fg font-medium flex-1">{issue.suggestion}</p>
                                                </div>

                                                <p className="text-xs text-muted leading-relaxed">{issue.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <RunButton
                        running={running}
                        onClick={handleCheck}
                        label={report ? "Check again" : "Check document"}
                        runningLabel="Checking..."
                    />
                    {running && (
                        <p className="text-center text-xs text-muted mt-3 flex items-center justify-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" />
                            Proofreading the whole document.
                        </p>
                    )}
                </>
            )}
        </ToolShell>
    );
}
