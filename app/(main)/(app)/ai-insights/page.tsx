"use client";

import { useState } from "react";
import { BrainCircuit, CalendarDays, CheckSquare, Users, Loader2 } from "lucide-react";
import { AiError, analyzeDocument, type DocumentInsights } from "@/lib/ai";
import { ErrorNote, FileDrop, RunButton, SelectedFile, ToolShell } from "@/components/tools/tool-shell";

function Section({
    icon: Icon,
    title,
    count,
    children,
}: {
    icon: typeof Users;
    title: string;
    count: number;
    children: React.ReactNode;
}) {
    if (count === 0) return null;

    return (
        <div className="p-5 rounded-2xl bg-card border border-card">
            <h2 className="text-fg font-semibold text-sm flex items-center gap-2 mb-3">
                <Icon size={14} className="text-[var(--primary)]" />
                {title}
                <span className="text-muted font-normal">({count})</span>
            </h2>
            {children}
        </div>
    );
}

export default function AiInsightsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [insights, setInsights] = useState<DocumentInsights | null>(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = (f: File) => {
        if (f.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        setFile(f);
        setInsights(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setRunning(true);
        setError(null);
        try {
            setInsights(await analyzeDocument(file));
        } catch (err) {
            setError(err instanceof AiError ? err.message : "Couldn't analyse that document.");
        } finally {
            setRunning(false);
        }
    };

    const empty =
        insights &&
        !insights.summary &&
        insights.keyPoints.length === 0 &&
        insights.entities.length === 0 &&
        insights.dates.length === 0 &&
        insights.actionItems.length === 0;

    return (
        <ToolShell
            icon={BrainCircuit}
            title="AI Insights"
            description="Pull the key points, people, dates and action items out of a document."
        >
            {!file ? (
                <FileDrop onFile={handleFile} />
            ) : (
                <>
                    <SelectedFile
                        name={file.name}
                        size={file.size}
                        disabled={running}
                        onClear={() => { setFile(null); setInsights(null); setError(null); }}
                    />

                    {error && <ErrorNote>{error}</ErrorNote>}

                    {empty && (
                        <ErrorNote>
                            Nothing stood out in that document — it may be mostly images, or too
                            short to analyse.
                        </ErrorNote>
                    )}

                    {insights && !empty && (
                        <div className="mt-6 space-y-4">
                            {insights.summary && (
                                <div className="p-5 rounded-2xl bg-card border border-card">
                                    <h2 className="text-fg font-semibold text-sm flex items-center gap-2 mb-2">
                                        <BrainCircuit size={14} className="text-[var(--primary)]" />
                                        Summary
                                    </h2>
                                    <p className="text-sm text-fg leading-relaxed">{insights.summary}</p>
                                </div>
                            )}

                            <Section icon={CheckSquare} title="Key points" count={insights.keyPoints.length}>
                                <ul className="space-y-2">
                                    {insights.keyPoints.map((point, i) => (
                                        <li key={i} className="text-sm text-fg leading-relaxed flex gap-2">
                                            <span className="text-[var(--primary)]">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Section>

                            <Section icon={Users} title="People &amp; organisations" count={insights.entities.length}>
                                <div className="flex flex-wrap gap-2">
                                    {insights.entities.map((entity, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-3 py-1.5 rounded-full bg-[var(--background-secondary)] text-fg"
                                        >
                                            {entity.name}
                                            <span className="text-muted ml-1.5">{entity.kind}</span>
                                        </span>
                                    ))}
                                </div>
                            </Section>

                            <Section icon={CalendarDays} title="Dates" count={insights.dates.length}>
                                <ul className="space-y-2">
                                    {insights.dates.map((d, i) => (
                                        <li key={i} className="text-sm flex gap-3">
                                            <span className="text-[var(--primary)] font-medium shrink-0">{d.date}</span>
                                            <span className="text-muted">{d.context}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Section>

                            <Section icon={CheckSquare} title="Action items" count={insights.actionItems.length}>
                                <ul className="space-y-2">
                                    {insights.actionItems.map((item, i) => (
                                        <li key={i} className="text-sm text-fg leading-relaxed flex gap-2">
                                            <span className="text-[var(--primary)]">→</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        </div>
                    )}

                    <RunButton
                        running={running}
                        onClick={handleAnalyze}
                        label={insights ? "Analyse again" : "Analyse document"}
                        runningLabel="Analysing..."
                    />
                    {running && (
                        <p className="text-center text-xs text-muted mt-3 flex items-center justify-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" />
                            Reading the whole document.
                        </p>
                    )}
                </>
            )}
        </ToolShell>
    );
}
