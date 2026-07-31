"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Scissors, Download } from "lucide-react";

// Mock page count and content-line widths until real PDF parsing is wired up on the backend.
const MOCK_PAGE_COUNT = 12;
const MOCK_LINE_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-full", "w-3/5", "w-5/6"];

export default function SplitPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [splitMode, setSplitMode] = useState<"range" | "every">("range");
    const [fromPage, setFromPage] = useState("1");
    const [toPage, setToPage] = useState("1");
    const [everyN, setEveryN] = useState("1");
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const [downloadChoice, setDownloadChoice] = useState<"split" | "remaining">("split");
    // true = next sidebar click sets the "from" page, false = next click sets "to"
    const [selectingFrom, setSelectingFrom] = useState(true);
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
        setDownloadChoice("split");
        setFromPage("1");
        setToPage("1");
        setSelectingFrom(true);
    };

    const handlePageClick = (page: number) => {
        if (splitMode !== "range") return;
        if (selectingFrom) {
            setFromPage(String(page));
            setToPage(String(page));
            setSelectingFrom(false);
        } else {
            const from = Number(fromPage);
            if (page >= from) {
                setToPage(String(page));
            } else {
                setToPage(fromPage);
                setFromPage(String(page));
            }
            setSelectingFrom(true);
        }
    };

    const handleSplit = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Left sidebar — vertical list on desktop, horizontal scroll strip on tablet/mobile */}
            {file && (
                <aside className="w-full lg:w-80 shrink-0 rounded-2xl bg-card  border border-card p-4 lg:sticky lg:top-6">
                    <p className="text-sm font-semibold text-fg truncate mb-1">{file.name}</p>
                    <p className="text-xs text-muted mb-4">
                        {splitMode === "range" ? "Tap/click pages to set range" : `${MOCK_PAGE_COUNT} pages`}
                    </p>
                    <div className="flex lg:block gap-3 lg:space-y-3 lg:space-x-0 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[75vh] pb-2 lg:pb-0 pr-0 lg:pr-1">
                        {Array.from({ length: MOCK_PAGE_COUNT }, (_, i) => i + 1).map((page) => {
                            const inRange =
                                splitMode === "range" &&
                                page >= Number(fromPage) &&
                                page <= Number(toPage);
                            const isEdge =
                                splitMode === "range" &&
                                (page === Number(fromPage) || page === Number(toPage));
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageClick(page)}
                                    className={`w-36 lg:w-full shrink-0 rounded-xl border p-4 text-left transition-colors ${isEdge
                                        ? "border-[var(--primary)] bg-red-50"
                                        : inRange
                                            ? "border-[var(--primary)]/40 bg-red-50/50"
                                            : "border-card bg-card  hover:border-[var(--primary)]/40"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span
                                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isEdge ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-muted"
                                                }`}
                                        >
                                            Page {page}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {MOCK_LINE_WIDTHS.map((w, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded ${w} ${isEdge || inRange ? "bg-[var(--primary)]/25" : "bg-[var(--background-secondary)]"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>
            )}

            {/* Right side — header + existing controls */}
            <div className={file ? "w-full lg:flex-1 lg:min-w-0 lg:max-w-2xl" : "max-w-3xl mx-auto w-full"}>
                <div className="text-center mb-8 lg:mb-10">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <Scissors className="text-[var(--primary)]" size={24} />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold text-fg">Split PDF</h1>
                    <p className="text-muted text-sm mt-1 px-4 lg:px-0">Separate one PDF into multiple files, or extract specific pages.</p>
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
                        <Upload className="mx-auto text-muted mb-3" size={28} />
                        <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                        <p className="text-muted text-xs mt-1">or tap to browse</p>
                    </div>
                ) : (
                    <>
                        {/* Selected file */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card  border border-card">
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

                        {/* Split options */}
                        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-card  border border-card">
                            <p className="text-sm font-medium text-fg mb-4">Split method</p>

                            <div className="flex flex-col sm:flex-row gap-2 mb-5">
                                <button
                                    onClick={() => setSplitMode("range")}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${splitMode === "range" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                        }`}
                                >
                                    Extract page range
                                </button>
                                <button
                                    onClick={() => setSplitMode("every")}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${splitMode === "every" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                        }`}
                                >
                                    Split every N pages
                                </button>
                            </div>

                            {splitMode === "range" ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-muted block mb-1">From page</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={fromPage}
                                            onChange={(e) => { setFromPage(e.target.value); setSelectingFrom(false); }}
                                            className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-muted block mb-1">To page</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={toPage}
                                            onChange={(e) => { setToPage(e.target.value); setSelectingFrom(true); }}
                                            className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs text-muted block mb-1">Pages per file</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={everyN}
                                        onChange={(e) => setEveryN(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            {!done && (
                                <button
                                    onClick={handleSplit}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                                >
                                    {processing ? "Splitting..." : "Split PDF"}
                                </button>
                            )}
                        </div>

                        {/* Preview method — choose which part to download */}
                        {done && (
                            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-card  border border-card">
                                <p className="text-sm font-medium text-fg mb-4">Preview method</p>

                                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                                    <button
                                        onClick={() => setDownloadChoice("split")}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${downloadChoice === "split" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                            }`}
                                    >
                                        Split part
                                    </button>
                                    <button
                                        onClick={() => setDownloadChoice("remaining")}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${downloadChoice === "remaining" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                            }`}
                                    >
                                        Remaining part
                                    </button>
                                </div>

                                <p className="text-xs text-muted mb-5">
                                    {downloadChoice === "split"
                                        ? splitMode === "range"
                                            ? `Pages ${fromPage}–${toPage} that you extracted.`
                                            : `The pages split out every ${everyN} page(s).`
                                        : "The pages left over after the split."}
                                </p>

                                <div className="text-center">
                                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                        <Download size={18} />
                                        Download {downloadChoice === "split" ? "Split" : "Remaining"} PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}