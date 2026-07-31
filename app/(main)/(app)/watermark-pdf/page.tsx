"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Droplet, Download, Lock, Crown } from "lucide-react";

type PlanTier = "free" | "paid";

const COMPANY_WATERMARK = "PDFAI";

export default function WatermarkPdfPage() {
    // Dev-only test switch — replace with real subscription/auth state later.
    const [planTier, setPlanTier] = useState<PlanTier>("free");

    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [includeCompanyWatermark, setIncludeCompanyWatermark] = useState(true);
    const [customText, setCustomText] = useState("");
    const [opacity, setOpacity] = useState(40);

    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isPaid = planTier === "paid";

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

    const handleApply = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    // Free plan: always show the company watermark, nothing else.
    // Paid plan: company watermark only if they've left it on, plus their own text if provided.
    const activeWatermarks: string[] = [];
    if (!isPaid || includeCompanyWatermark) activeWatermarks.push(COMPANY_WATERMARK);
    if (isPaid && customText.trim()) activeWatermarks.push(customText.trim());

    const canApply = isPaid ? activeWatermarks.length > 0 : true;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-0">
            {/* Dev-only plan switch — remove once real subscription state is wired up */}
            <div className="mb-6 flex items-center justify-center gap-2 text-xs">
                <span className="text-muted">Testing as:</span>
                <div className="inline-flex rounded-full border border-card bg-card  p-1">
                    <button
                        onClick={() => setPlanTier("free")}
                        className={`px-3 py-1 rounded-full transition-colors ${planTier === "free" ? "bg-[var(--primary)] text-white" : "text-muted"
                            }`}
                    >
                        Free Plan
                    </button>
                    <button
                        onClick={() => setPlanTier("paid")}
                        className={`px-3 py-1 rounded-full transition-colors ${planTier === "paid" ? "bg-[var(--primary)] text-white" : "text-muted"
                            }`}
                    >
                        Paid Plan
                    </button>
                </div>
            </div>

            <div className="text-center mb-8 sm:mb-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <Droplet className="text-[var(--primary)]" size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-fg">Add Watermark</h1>
                <p className="text-muted text-sm mt-1 px-2 sm:px-0">Stamp text across every page of your PDF.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card "
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={26} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or tap to browse</p>
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
                        <button
                            onClick={() => { setFile(null); setDone(false); }}
                            className="text-muted hover:text-[var(--primary)] shrink-0 p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Watermark preview */}
                    <div className="mt-6 relative rounded-2xl border border-cardbg-card  p-6 sm:p-10 h-48 flex flex-col items-center justify-center gap-2 overflow-hidden">
                        {activeWatermarks.length === 0 ? (
                            <span className="text-sm text-muted">No watermark selected</span>
                        ) : (
                            activeWatermarks.map((text, i) => (
                                <span
                                    key={i}
                                    className="text-2xl sm:text-4xl font-bold text-[var(--primary)] rotate-[-30deg] select-none whitespace-nowrap"
                                    style={{ opacity: opacity / 100 }}
                                >
                                    {text}
                                </span>
                            ))
                        )}
                    </div>

                    {/* Options */}
                    <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-card  border border-card space-y-5">
                        {/* Company watermark row */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-fg">Company watermark</p>
                                <p className="text-xs text-muted mt-0.5 truncate">"{COMPANY_WATERMARK}" on every page</p>
                            </div>
                            {isPaid ? (
                                <button
                                    onClick={() => setIncludeCompanyWatermark((v) => !v)}
                                    role="switch"
                                    aria-checked={includeCompanyWatermark}
                                    className={`shrink-0 relative w-11 h-6 rounded-full transition-colors duration-200 ${includeCompanyWatermark ? "bg-[var(--primary)]" : "bg-card"
                                        }`}
                                >
                                    <span
                                        className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-card  shadow-sm transition-transform duration-200 ${includeCompanyWatermark ? "translate-x-5" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            ) : (
                                <span className="shrink-0 inline-flex items-center gap-1 text-xs text-muted px-2.5 py-1 rounded-full bg-bg">
                                    <Lock size={12} />
                                    Always on
                                </span>
                            )}
                        </div>

                        {/* Custom watermark — paid only */}
                        {isPaid ? (
                            <div className="pt-5 border-t border-card space-y-5">
                                <div>
                                    <label className="text-xs text-muted block mb-1">Your watermark text</label>
                                    <input
                                        type="text"
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        placeholder="e.g. DRAFT, ACME CORP"
                                        className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted block mb-1">Opacity: {opacity}%</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="80"
                                        value={opacity}
                                        onChange={(e) => setOpacity(Number(e.target.value))}
                                        className="w-full accent-[var(--primary)]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="pt-5 border-t border-card">
                                <div className="rounded-xl bg-card  p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-card  border border-card flex items-center justify-center shrink-0">
                                        <Crown size={14} className="text-[var(--primary)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-fg">Add your own watermark</p>
                                        <p className="text-xs text-muted mt-0.5">
                                            Upgrade to a paid plan to add your own custom watermark text and remove the company watermark.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleApply}
                                disabled={processing || !canApply}
                                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Applying..." : "Add Watermark"}
                            </button>
                        ) : (
                            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Watermarked PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}