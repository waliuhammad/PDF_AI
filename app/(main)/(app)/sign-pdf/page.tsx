"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, X, Download, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { UploadCard } from "@/components/tools/upload-card";
import type * as PdfjsLib from "pdfjs-dist";
import { loadPdfjs } from "@/lib/pdf-libs";
import { errorName } from "@/lib/errors";

/**
 * The faces pdf-lib can embed from the PDF standard set, so the preview and
 * the signed file agree. `css` is the nearest browser equivalent for the
 * canvas preview; the id is what the route maps back to a StandardFont.
 */
const FONT_OPTIONS = [
    { id: "helvetica-oblique", label: "Signature (italic)", css: "italic 1em Helvetica, Arial, sans-serif" },
    { id: "helvetica", label: "Sans", css: "1em Helvetica, Arial, sans-serif" },
    { id: "helvetica-bold", label: "Sans bold", css: "bold 1em Helvetica, Arial, sans-serif" },
    { id: "times-italic", label: "Serif italic", css: "italic 1em 'Times New Roman', Times, serif" },
    { id: "times", label: "Serif", css: "1em 'Times New Roman', Times, serif" },
    { id: "times-bold", label: "Serif bold", css: "bold 1em 'Times New Roman', Times, serif" },
    { id: "courier-oblique", label: "Mono italic", css: "italic 1em 'Courier New', Courier, monospace" },
    { id: "courier", label: "Mono", css: "1em 'Courier New', Courier, monospace" },
] as const;

type FontChoice = (typeof FONT_OPTIONS)[number]["id"];

/** Ink colours, matching the palette the watermark tool offers. */
const SIGNATURE_COLORS = [
    "#0f172a",
    "#1d4ed8",
    "#dc2626",
    "#059669",
    "#7c3aed",
    "#d97706",
];

export default function SignPdfPage() {
  const [file, setFile] = useState<{ name: string; size: string; rawFile: File } | null>(null);
  const [mode, setMode] = useState<"type" | "draw">("type");
  const [signatureText, setSignatureText] = useState("");

  // PDF Preview and Advanced States
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDocProxy, setPdfDocProxy] = useState<PdfjsLib.PDFDocumentProxy | null>(null);
  const [position, setPosition] = useState<"left" | "center" | "right">("right");
  const [signScope, setSignScope] = useState<"specific" | "all">("specific");

  // Drawing states
  const [penColor, setPenColor] = useState("#0f172a");
  // Typography for the typed signature. The faces are the ones pdf-lib can
  // embed without shipping a font file, so what the preview shows is what the
  // PDF can actually contain.
  const [fontFamily, setFontFamily] = useState<FontChoice>("helvetica-oblique");
  const [fontSize, setFontSize] = useState(18);
  const [isDrawing, setIsDrawing] = useState(false);
  /** True once a stroke has been drawn, so an untouched canvas can't be "signed" with. */
  const [hasDrawn, setHasDrawn] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<PdfjsLib.RenderTask | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") return;

    setFile({ name: f.name, size: formatSize(f.size), rawFile: f });
    setErrorMessage(null);
    setSuccessMessage(false);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfjsLib = await loadPdfjs();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDocProxy(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading PDF preview:", err);
    }
  };

  useEffect(() => {
    if (!pdfDocProxy) return;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
        }

        const page = await pdfDocProxy.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 0.8 });
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderTask = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (isCancelled) return;

        const hasSignature = mode === "type" ? signatureText.trim().length > 0 : canvasRef.current !== null;

        if (hasSignature) {
          const margin = 30;
          const sigY = canvas.height - 35;
          let sigX = margin;

          if (mode === "type" && signatureText.trim()) {
            // Was a fixed "italic 18px cursive", so neither the face nor the
            // size chosen in the panel showed here. The CSS shorthand carries
            // style and family together, with 1em swapped for the real size.
            const face =
              FONT_OPTIONS.find((f) => f.id === fontFamily)?.css ?? FONT_OPTIONS[0].css;
            context.font = face.replace("1em", `${fontSize}px`);
            context.fillStyle = penColor;
            const metrics = context.measureText(signatureText);
            const textWidth = metrics.width;

            if (position === "center") {
              sigX = (canvas.width - textWidth) / 2;
            } else if (position === "right") {
              sigX = canvas.width - textWidth - margin;
            }

            context.fillText(signatureText, sigX, sigY);
          } else if (mode === "draw" && canvasRef.current) {
            const drawCanvas = canvasRef.current;
            const imgWidth = 120;
            const imgHeight = 40;

            if (position === "center") {
              sigX = (canvas.width - imgWidth) / 2;
            } else if (position === "right") {
              sigX = canvas.width - imgWidth - margin;
            }

            context.drawImage(drawCanvas, sigX, sigY - imgHeight + 10, imgWidth, imgHeight);
          }
        }
      } catch (err) {
        // Render cancellations are routine when flipping pages quickly.
        if (errorName(err) !== "RenderingCancelledException") {
          console.error("Preview render error:", err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDocProxy, currentPage, signatureText, mode, position, penColor, fontFamily, fontSize]);

  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 340;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = penColor;
      }
      setHasDrawn(false);
    }
  }, [mode, penColor]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  /**
   * Signs on the server and downloads the result. The previous version
   * downloaded the untouched uploaded file under a "signed_" name — the
   * /api/sign-pdf route existed but was never called, so no download was
   * ever actually signed.
   */
  const executeSignAndDownload = async () => {
    if (!file) return;

    setProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(false);

    try {
      const formData = new FormData();
      formData.append("file", file.rawFile);
      formData.append("signMode", mode);
      formData.append("pageNumber", String(currentPage));
      formData.append("position", position);
      formData.append("signScope", signScope);

      if (mode === "type") {
        formData.append("signatureText", signatureText.trim());
        formData.append("fontFamily", fontFamily);
        formData.append("fontSize", String(fontSize));
      } else {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) {
          setErrorMessage("Please draw your signature first.");
          setProcessing(false);
          return;
        }
        formData.append("signatureImage", canvas.toDataURL("image/png"));
      }

      const response = await fetch("/api/sign-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || errorData.message || "Failed to sign the document.");
        setProcessing(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}-signed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage(true);
    } catch {
      setErrorMessage("An error occurred while signing the document.");
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = mode === "type" ? signatureText.trim().length > 0 : hasDrawn;

  return (
    <div className="min-h-screen bg-background text-fg flex items-center justify-center p-4 font-sans transition-colors">
      <div className="w-full max-w-4xl bg-card border border-card rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">

        {!file ? (
          <>
            {/* Header Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-slate-900/60 border border-slate-900/10 dark:border-slate-800 text-fg text-xs font-semibold tracking-wide">
                <Sparkles size={13} className="text-fg" />
                DOCUMENT CONVERSION SUITE
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-fg mb-2">Sign PDF Tool</h1>
              <p className="text-muted text-sm">Add text or drawn signatures with precise positioning.</p>
            </div>

            {/* Upload Box */}
            <UploadCard
              onFiles={handleFile}
              title="Click to upload PDF document"
              hint="Supports text documents and reports"
              note={
                <>
                  <ShieldCheck size={14} className="text-[var(--primary)]" />
                  <span>Secure PDF text extraction • No file retention</span>
                </>
              }
            />
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-card pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-900/5 dark:bg-slate-800 border border-slate-900/10 dark:border-slate-700 flex items-center justify-center text-fg shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg truncate">{file.name}</p>
                  <p className="text-muted text-xs">{file.size} • {numPages} {numPages === 1 ? 'Page' : 'Pages'}</p>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setPdfDocProxy(null); setErrorMessage(null); setSuccessMessage(false); }}
                className="w-8 h-8 rounded-lg bg-[var(--background-secondary)] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-muted hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* PDF Preview & Pagination Controls */}
            {numPages > 0 && (
              <div className="space-y-3 bg-[var(--background-secondary)] p-4 rounded-2xl border border-card">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted font-medium">
                  <span>Page Preview (Page {currentPage} of {numPages})</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 rounded text-xs text-fg"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= numPages}
                      onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 rounded text-xs text-fg"
                    >
                      Next →
                    </button>
                  </div>
                </div>
                <div className="flex justify-center bg-slate-200/50 dark:bg-black/40 rounded-xl p-2 overflow-hidden border border-card">
                  <canvas ref={previewCanvasRef} className="rounded shadow max-h-60 max-w-full object-contain" />
                </div>
              </div>
            )}

            {/* Config options */}
            <div className="bg-[var(--background-secondary)] p-4 sm:p-5 rounded-2xl border border-card space-y-4">
              <div className="flex gap-2 bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-xl border border-card">
                <button
                  type="button"
                  onClick={() => setMode("type")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${mode === "type" ? "bg-slate-900 dark:bg-slate-800 text-white shadow" : "text-muted hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  Type Signature
                </button>
                <button
                  type="button"
                  onClick={() => setMode("draw")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${mode === "draw" ? "bg-slate-900 dark:bg-slate-800 text-white shadow" : "text-muted hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  Draw Signature
                </button>
              </div>

              {mode === "type" ? (
                <div>
                  <label className="text-xs text-muted block mb-1 font-medium">Your Name / Signature Text</label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="e.g. Maniha Iman"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-card bg-card text-sm text-fg focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                  />

                  {/* Typography and ink for the typed signature. Draw mode has
                      had a colour row all along; typing had neither, so the
                      signature was always the same face, size and colour. */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs text-muted block mb-1 font-medium">Font</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value as FontChoice)}
                        className="w-full px-3 py-2 rounded-xl border border-card bg-card text-sm text-fg focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted block mb-1 font-medium">
                        Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min={8}
                        max={48}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-slate-900 dark:accent-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted block mb-1.5 font-medium">Ink Colour</label>
                      <div className="flex flex-wrap items-center gap-2">
                        {SIGNATURE_COLORS.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setPenColor(col)}
                            title={col}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${penColor.toLowerCase() === col.toLowerCase()
                              ? "border-slate-900 dark:border-white scale-110"
                              : "border-transparent"
                              }`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                        <input
                          type="color"
                          value={penColor}
                          onChange={(e) => setPenColor(e.target.value)}
                          aria-label="Custom ink colour"
                          className="h-7 w-10 rounded-lg border border-card bg-card cursor-pointer p-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Draw Signature
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1.5">
                        {/* The same palette the typed mode offers, so switching
                            between them does not change the available inks. */}
                        {SIGNATURE_COLORS.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setPenColor(col)}
                            className={`w-4 h-4 rounded-full border ${penColor === col ? "border-slate-900 dark:border-white scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      <button type="button" onClick={clearCanvas} className="text-xs text-muted hover:text-slate-900 dark:hover:text-white underline">
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl overflow-hidden border border-card flex justify-center p-2">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair touch-none bg-white rounded-lg max-w-full"
                    />
                  </div>
                </div>
              )}

              {/* Scope & Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Signing Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignScope("specific")}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${signScope === "specific"
                        ? "bg-slate-900/5 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-fg"
                        : "border-card bg-card text-muted"
                        }`}
                    >
                      Page {currentPage}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignScope("all")}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${signScope === "all"
                        ? "bg-slate-900/5 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-fg"
                        : "border-card bg-card text-muted"
                        }`}
                    >
                      All Pages
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["left", "center", "right"] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`py-2 text-xs font-semibold rounded-xl border uppercase tracking-wider transition-all ${position === pos
                          ? "bg-slate-900/5 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-fg"
                          : "border-card bg-card text-muted"
                          }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Document signed & downloaded successfully!
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={executeSignAndDownload}
                disabled={!isFormValid || processing}
                title={isFormValid ? undefined : mode === "type" ? "Type your signature first" : "Draw your signature first"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-colors text-sm shadow-lg bg-[#0d1322] border border-slate-700 hover:bg-[#131b2e] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#0d1322]"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Signing Document...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Signed PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}