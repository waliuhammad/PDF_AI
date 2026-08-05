"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Copy, Download, ScanText, Loader2, AlertCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 25 * 1024 * 1024;

/** Rendered well above display size — OCR accuracy depends on input resolution. */
const RENDER_SCALE = 2;

interface PageResult {
    page: number;
    text: string;
}

export default function OcrPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState("");
    const [pages, setPages] = useState<PageResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) =>
        bytes < 1024 * 1024
            ? `${(bytes / 1024).toFixed(0)} KB`
            : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    const reset = () => {
        setPages([]);
        setError(null);
        setProgress(0);
        setStage("");
    };

    const handleFile = (list: FileList | null) => {
        const f = list?.[0];
        if (!f) return;

        if (!ACCEPTED.includes(f.type)) {
            setError("Upload a PDF or an image (PNG, JPG or WebP).");
            return;
        }
        if (f.size > MAX_BYTES) {
            setError("That file is larger than the 25 MB limit.");
            return;
        }

        setFile(f);
        reset();
    };

    /** Renders each PDF page to a canvas, since OCR reads pixels rather than PDF objects. */
    const renderPdfPages = async (source: File) => {
        const data = await source.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const canvases: HTMLCanvasElement[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: RENDER_SCALE });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const context = canvas.getContext("2d");
            if (!context) throw new Error("Couldn't prepare the page for scanning.");

            await page.render({ canvasContext: context, viewport }).promise;
            canvases.push(canvas);
        }

        return canvases;
    };

    const handleExtract = async () => {
        if (!file) return;

        setRunning(true);
        reset();

        // Loaded on demand: the recognition engine and its language data are a
        // large download, and most visitors to this page never run a scan.
        const { createWorker } = await import("tesseract.js");
        let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

        try {
            setStage("Loading the text recognition engine...");
            worker = await createWorker("eng");

            setStage("Reading the document...");
            const sources: (HTMLCanvasElement | File)[] =
                file.type === "application/pdf" ? await renderPdfPages(file) : [file];

            const results: PageResult[] = [];
            for (let i = 0; i < sources.length; i++) {
                setStage(`Scanning page ${i + 1} of ${sources.length}...`);
                const { data } = await worker.recognize(sources[i]);
                results.push({ page: i + 1, text: data.text.trim() });
                setProgress(((i + 1) / sources.length) * 100);
            }

            setPages(results);

            if (results.every((r) => !r.text)) {
                setError("No text was found. If the scan is faint or skewed, a clearer copy usually helps.");
            }
        } catch (err) {
            console.error("OCR failed:", err);
            setError(err instanceof Error ? err.message : "Couldn't extract text from that file.");
        } finally {
            await worker?.terminate();
            setRunning(false);
            setStage("");
        }
    };

    const fullText = pages
        .map((p) => (pages.length > 1 ? `--- Page ${p.page} ---\n${p.text}` : p.text))
        .join("\n\n");

    const handleCopy = () => {
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleDownload = () => {
        const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file?.name.replace(/\.[^/.]+$/, "") ?? "extracted"}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                    <ScanText className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">OCR PDF</h1>
                <p className="text-muted text-sm mt-1">
                    Extract text from scanned PDFs and images. Runs in your browser — the file is never uploaded.
                </p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-card bg-card"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        hidden
                        onChange={(e) => handleFile(e.target.files)}
                    />
                    <Upload className="mx-auto text-[var(--primary)] mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag &amp; drop a scanned PDF or image</p>
                    <p className="text-muted text-xs mt-1">or click to browse — PDF, PNG, JPG or WebP, up to 25 MB</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
                        <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-fg text-sm truncate">{file.name}</p>
                            <p className="text-muted text-xs">{formatSize(file.size)}</p>
                        </div>
                        <button
                            onClick={() => { setFile(null); reset(); }}
                            disabled={running}
                            className="text-muted hover:text-fg shrink-0 disabled:opacity-50"
                            aria-label="Remove file"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {running && (
                        <div className="mt-6 p-5 rounded-2xl bg-card border border-card">
                            <div className="flex items-center gap-2 mb-3">
                                <Loader2 size={15} className="animate-spin text-[var(--primary)]" />
                                <p className="text-sm text-fg">{stage}</p>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[var(--primary)] transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 flex items-start gap-2 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-600">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {pages.length > 0 && fullText && (
                        <div className="mt-6 p-5 rounded-2xl bg-card border border-card">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-fg font-semibold text-sm flex items-center gap-2">
                                    <ScanText size={14} className="text-[var(--primary)]" />
                                    Extracted text
                                    <span className="text-muted font-normal">
                                        ({pages.length} {pages.length === 1 ? "page" : "pages"})
                                    </span>
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCopy}
                                        className="text-muted hover:text-[var(--primary)] flex items-center gap-1 text-xs"
                                    >
                                        <Copy size={13} />
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="text-muted hover:text-[var(--primary)] flex items-center gap-1 text-xs"
                                    >
                                        <Download size={13} />
                                        .txt
                                    </button>
                                </div>
                            </div>
                            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm text-fg leading-relaxed font-sans">
                                {fullText}
                            </pre>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <button
                            onClick={handleExtract}
                            disabled={running}
                            className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                            {running && <Loader2 size={16} className="animate-spin" />}
                            {running ? "Scanning..." : pages.length > 0 ? "Scan again" : "Extract text"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
