"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Trash2, Download, PenLine, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { SecureNote, UploadCard } from "@/components/tools/upload-card";
import type * as PdfjsLib from "pdfjs-dist";
import { loadPdfjs } from "@/lib/pdf-libs";
import { errorName } from "@/lib/errors";
import { downloadBlob } from "@/lib/download";
import { useCancellableRun, wasCancelled } from "@/hooks/useCancellableRun";

const PREVIEW_SCALE = 0.8;

/** The signature image's size on the page, in PDF points. Matches the route. */
const IMAGE_SIZE = { width: 150, height: 50 };

/** Empty space around the trimmed ink inside the signature box, in the same units as IMAGE_SIZE. */
const SIGNATURE_PADDING = 4;

/** Stroke width for the draw canvas, in canvas pixels. Bumped up from 2 for a bolder line. */
const PEN_WIDTH = 3;

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

const SIGNATURE_COLORS = [
  "#0f172a",
  "#1d4ed8",
  "#dc2626",
  "#059669",
  "#7c3aed",
  "#d97706",
];

/**
 * Finds the bounding box of non-transparent ink in a canvas. Returns null
 * if the canvas has nothing drawn on it.
 */
const trimCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  if (width === 0 || height === 0) return null;

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return null;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const alpha = data[rowOffset + x * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
};

/**
 * Builds a boxW x boxH canvas containing just the trimmed ink from `source`,
 * scaled up (preserving aspect ratio) to fill as much of the box as
 * possible and centered.
 */
const buildFittedSignatureCanvas = (
  source: HTMLCanvasElement,
  boxW: number,
  boxH: number,
  padding = SIGNATURE_PADDING
) => {
  const out = document.createElement("canvas");
  out.width = boxW;
  out.height = boxH;
  const octx = out.getContext("2d");
  if (!octx) return out;

  const bounds = trimCanvas(source);
  if (!bounds) return out;

  const availW = Math.max(1, boxW - padding * 2);
  const availH = Math.max(1, boxH - padding * 2);
  const scale = Math.min(availW / bounds.width, availH / bounds.height);

  const drawW = bounds.width * scale;
  const drawH = bounds.height * scale;
  const dx = (boxW - drawW) / 2;
  const dy = (boxH - drawH) / 2;

  octx.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, dx, dy, drawW, drawH);
  return out;
};

/** Parses a "#rrggbb" hex string into 0–255 channel values. */
const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

/**
 * Recolors every already-drawn (non-transparent) pixel on a canvas to a new
 * color, keeping each pixel's existing alpha — so the stroke shape/thickness
 * is untouched, only the ink color changes. This is what lets picking a new
 * color update the signature that's already there instead of only affecting
 * strokes drawn after the change.
 */
const recolorInk = (canvas: HTMLCanvasElement, hexColor: string) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  if (width === 0 || height === 0) return;

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, width, height);
  } catch {
    return;
  }

  const { r, g, b } = hexToRgb(hexColor);
  const data = imageData.data;
  let touchedAny = false;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      touchedAny = true;
    }
  }

  if (touchedAny) ctx.putImageData(imageData, 0, 0);
};

export default function SignPdfPage() {
  const [file, setFile] = useState<{ name: string; size: string; rawFile: File } | null>(null);
  const { begin, cancel } = useCancellableRun();
  const [mode, setMode] = useState<"type" | "draw">("type");
  const [signatureText, setSignatureText] = useState("");

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDocProxy, setPdfDocProxy] = useState<PdfjsLib.PDFDocumentProxy | null>(null);
  const [position, setPosition] = useState<"left" | "center" | "right">("right");

  const [sigPos, setSigPos] = useState<{ x: number; y: number }>({ x: 0.07, y: 0.88 });
  const [dragging, setDragging] = useState(false);

  const sigSizeRef = useRef({ w: 120, h: 40 });
  const [signScope, setSignScope] = useState<"specific" | "all">("specific");

  const [penColor, setPenColor] = useState("#0f172a");
  const [fontFamily, setFontFamily] = useState<FontChoice>("helvetica-oblique");
  const [fontSize, setFontSize] = useState(18);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<PdfjsLib.RenderTask | null>(null);
  const pdfBaseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Tracks the color the ink currently on canvasRef was last painted in, so
  // the recolor effect doesn't run pointlessly on mount before anything's
  // been drawn, and so it always knows what it's updating from.
  const lastPenColorRef = useRef(penColor);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const positionFromPointer = (clientX: number, clientY: number) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const { w, h } = sigSizeRef.current;

    const px = (clientX - rect.left) * scaleX - w / 2;
    const py = (clientY - rect.top) * scaleY - h / 2;

    return {
      x: clamp(px / canvas.width, 0, Math.max(0, 1 - w / canvas.width)),
      y: clamp(py / canvas.height, 0, Math.max(0, 1 - h / canvas.height)),
    };
  };

  const handleDragStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const next = positionFromPointer(e.clientX, e.clientY);
    if (!next) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setSigPos(next);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const next = positionFromPointer(e.clientX, e.clientY);
    if (next) setSigPos(next);
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const applyPreset = (preset: "left" | "center" | "right") => {
    setPosition(preset);

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const margin = 30 * PREVIEW_SCALE;
    const { w } = sigSizeRef.current;

    const x =
      preset === "left"
        ? margin
        : preset === "center"
          ? (canvas.width - w) / 2
          : canvas.width - w - margin;

    setSigPos((prev) => ({
      ...prev,
      x: clamp(x / canvas.width, 0, Math.max(0, 1 - w / canvas.width)),
    }));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF document.");
      return;
    }

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
      if (wasCancelled(err)) return;
      console.error("Error loading PDF preview:", err);
      setErrorMessage("Failed to load the PDF preview.");
    }
  };

  const clearFile = () => {
    cancel();
    setFile(null);
    setPdfDocProxy(null);
    setNumPages(0);
    setErrorMessage(null);
    setSuccessMessage(false);
  };

  const redrawPreview = () => {
    const canvas = previewCanvasRef.current;
    const baseCanvas = pdfBaseCanvasRef.current;
    if (!canvas || !baseCanvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(baseCanvas, 0, 0);

    const hasSignature = mode === "type" ? signatureText.trim().length > 0 : hasDrawn;
    if (!hasSignature) return;

    const sigX = sigPos.x * canvas.width;
    const sigTop = sigPos.y * canvas.height;

    if (mode === "type" && signatureText.trim()) {
      const face = FONT_OPTIONS.find((f) => f.id === fontFamily)?.css ?? FONT_OPTIONS[0].css;
      const previewFontPx = fontSize * PREVIEW_SCALE;
      context.font = face.replace("1em", `${previewFontPx}px`);
      context.fillStyle = penColor;
      const textWidth = context.measureText(signatureText).width;

      sigSizeRef.current = { w: textWidth, h: previewFontPx };

      context.fillText(signatureText, sigX, sigTop + previewFontPx);
    } else if (mode === "draw" && canvasRef.current && hasDrawn) {
      const imgWidth = IMAGE_SIZE.width * PREVIEW_SCALE;
      const imgHeight = IMAGE_SIZE.height * PREVIEW_SCALE;

      sigSizeRef.current = { w: imgWidth, h: imgHeight };

      const fitted = buildFittedSignatureCanvas(canvasRef.current, IMAGE_SIZE.width, IMAGE_SIZE.height);
      context.drawImage(fitted, sigX, sigTop, imgWidth, imgHeight);
    }

    if (dragging) {
      const { w, h } = sigSizeRef.current;
      context.save();
      context.strokeStyle = "#6d5de0";
      context.setLineDash([5, 4]);
      context.lineWidth = 1.5;
      context.strokeRect(sigX - 3, sigTop - 3, w + 6, h + 6);
      context.restore();
    }
  };

  const loadAndRenderBasePage = async (pageNum: number, doc: PdfjsLib.PDFDocumentProxy) => {
    try {
      if (renderTaskRef.current) {
        await renderTaskRef.current.cancel();
      }

      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: PREVIEW_SCALE });

      if (!pdfBaseCanvasRef.current) {
        pdfBaseCanvasRef.current = document.createElement("canvas");
      }
      const baseCanvas = pdfBaseCanvasRef.current;
      baseCanvas.width = viewport.width;
      baseCanvas.height = viewport.height;
      const baseContext = baseCanvas.getContext("2d");
      if (!baseContext) return;

      const renderTask = page.render({ canvasContext: baseContext, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      const visibleCanvas = previewCanvasRef.current;
      if (visibleCanvas) {
        visibleCanvas.width = viewport.width;
        visibleCanvas.height = viewport.height;
      }

      redrawPreview();
    } catch (err) {
      if (wasCancelled(err)) return;
      if (errorName(err) !== "RenderingCancelledException") {
        console.error("Preview render error:", err);
      }
    }
  };

  useEffect(() => {
    if (!pdfDocProxy) return;
    loadAndRenderBasePage(currentPage, pdfDocProxy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocProxy, currentPage]);

  useEffect(() => {
    if (!pdfBaseCanvasRef.current) return;
    redrawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigPos, dragging, mode, signatureText, penColor, fontFamily, fontSize, hasDrawn]);

  useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    const container = drawCanvasContainerRef.current;
    if (!canvas || !container) return;

    const sizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = PEN_WIDTH;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = penColor;
      }
      setHasDrawn(false);
    };

    sizeCanvas();

    const observer = new ResizeObserver(sizeCanvas);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /**
   * Two jobs when the ink color changes:
   * 1. Set strokeStyle so anything drawn from now on uses the new color.
   * 2. Recolor whatever's already on the canvas, so switching color updates
   *    the existing signature in place instead of requiring a redraw.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.strokeStyle = penColor;

    if (hasDrawn && lastPenColorRef.current !== penColor) {
      recolorInk(canvas, penColor);
      redrawPreview();
    }
    lastPenColorRef.current = penColor;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penColor]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (point.clientX - rect.left) * scaleX, y: (point.clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsDrawing(true);
    setHasDrawn(true);
    redrawPreview();
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
    redrawPreview();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    redrawPreview();
  };

  const executeSignAndDownload = async () => {
    const signal = begin();
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
      formData.append("x", String(sigPos.x));
      formData.append("y", String(sigPos.y));
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
        const fitted = buildFittedSignatureCanvas(canvas, IMAGE_SIZE.width, IMAGE_SIZE.height);
        formData.append("signatureImage", fitted.toDataURL("image/png"));
      }

      const response = await fetch("/api/sign-pdf", {
        method: "POST",
        body: formData, signal });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || errorData.message || "Failed to sign the document.");
        setProcessing(false);
        return;
      }

      const blob = await response.blob();
      downloadBlob(blob, `${file.name.replace(/\.[^/.]+$/, "")}-signed.pdf`);

      setSuccessMessage(true);
    } catch {
      setErrorMessage("An error occurred while signing the document.");
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = mode === "type" ? signatureText.trim().length > 0 : hasDrawn;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-card border border-card flex items-center justify-center mb-3 text-fg shadow-sm">
          <PenLine className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-fg tracking-tight px-2">Sign PDF Tool</h1>
        <p className="text-muted text-[13px] sm:text-sm mt-1.5 max-w-xs sm:max-w-lg mx-auto leading-relaxed">
          Add text or drawn signatures with precise positioning.
        </p>
      </div>

      {!file ? (
        <div className="space-y-4">
          <UploadCard
            onFiles={handleFile}
            title="Click to browse or drag & drop a PDF"
            hint="Supports text documents and reports"
          />

          {errorMessage && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] sm:text-sm font-semibold text-center">
              {errorMessage}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-card border border-card rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900/5 dark:bg-slate-800 border border-slate-900/10 dark:border-slate-700 flex items-center justify-center text-fg shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] sm:text-sm font-bold text-fg truncate">{file.name}</p>
                <p className="text-muted text-[11px] sm:text-xs mt-0.5 truncate">
                  Size: <strong className="text-fg">{file.size}</strong> • {numPages}{" "}
                  {numPages === 1 ? "Page" : "Pages"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-2 sm:p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {numPages > 0 && (
            <div className="space-y-3 bg-[var(--background-secondary)] p-3 sm:p-4 rounded-2xl border border-card">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-muted font-medium">
                <span>
                  Page {currentPage} of {numPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-semibold text-fg"
                  >
                    ← Prev
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= numPages}
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-semibold text-fg"
                  >
                    Next →
                  </button>
                </div>
              </div>
              <div className="flex justify-center bg-slate-200/50 dark:bg-black/40 rounded-xl p-2 overflow-hidden border border-card">
                <canvas
                  ref={previewCanvasRef}
                  onPointerDown={handleDragStart}
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                  className={`rounded shadow max-h-52 sm:max-h-72 max-w-full object-contain touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                />
              </div>
              <p className="text-[11px] text-muted mt-2 text-center">
                Drag on the page to place your signature anywhere, or use the presets below.
              </p>
            </div>
          )}

          <div className="bg-[var(--background-secondary)] p-3.5 sm:p-5 rounded-2xl border border-card space-y-4">
            <div className="flex gap-2 bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-xl border border-card">
              <button
                type="button"
                onClick={() => setMode("type")}
                className={`flex-1 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors ${mode === "type"
                  ? "bg-slate-900 dark:bg-slate-800 text-white shadow"
                  : "text-muted hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                Type Signature
              </button>
              <button
                type="button"
                onClick={() => setMode("draw")}
                className={`flex-1 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors ${mode === "draw"
                  ? "bg-slate-900 dark:bg-slate-800 text-white shadow"
                  : "text-muted hover:text-slate-900 dark:hover:text-white"
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
                  placeholder="e.g. Your Name"
                  className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-card bg-card text-base sm:text-sm text-fg focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
                />

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-muted block mb-1 font-medium">Font</label>
                    <div className="relative">
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value as FontChoice)}
                        className="w-full appearance-none pl-3 pr-9 sm:pr-10 py-3 sm:py-2 rounded-xl border border-card bg-card text-base sm:text-sm text-fg focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 cursor-pointer"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1 font-medium">Size: {fontSize}px</label>
                    <input
                      type="range"
                      min={8}
                      max={48}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-6 accent-slate-900 dark:accent-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1.5 font-medium">Ink Colour</label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {SIGNATURE_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setPenColor(col)}
                          title={col}
                          aria-label={`Ink colour ${col}`}
                          className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-transform shrink-0 ${penColor.toLowerCase() === col.toLowerCase()
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
                        className="h-8 w-11 sm:h-7 sm:w-10 rounded-lg border border-card bg-card cursor-pointer p-0.5 shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">Draw Signature</label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {SIGNATURE_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setPenColor(col)}
                          aria-label={`Ink colour ${col}`}
                          className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full border shrink-0 ${penColor === col ? "border-slate-900 dark:border-white scale-110" : "border-transparent"
                            }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-muted hover:text-slate-900 dark:hover:text-white underline shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div
                  ref={drawCanvasContainerRef}
                  className="bg-white rounded-xl overflow-hidden border border-card w-full h-40 sm:h-48"
                >
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair touch-none bg-white block w-full h-full"
                  />
                </div>
                <p className="text-[11px] text-muted text-center">
                  Sign with your finger or mouse inside the box — it mirrors onto the page preview above as you draw.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Signing Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignScope("specific")}
                    className={`py-2.5 sm:py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${signScope === "specific"
                      ? "bg-slate-900/5 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-fg"
                      : "border-card bg-card text-muted"
                      }`}
                  >
                    Page {currentPage}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignScope("all")}
                    className={`py-2.5 sm:py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${signScope === "all"
                      ? "bg-slate-900/5 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-fg"
                      : "border-card bg-card text-muted"
                      }`}
                  >
                    All Pages
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["left", "center", "right"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => applyPreset(pos)}
                      className={`py-2.5 sm:py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-xl border uppercase tracking-wider transition-all ${position === pos
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
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-[13px] sm:text-sm text-center font-semibold">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[13px] sm:text-sm font-semibold flex items-start sm:items-center justify-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 sm:mt-0" />
              <span>Document signed and downloaded.</span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={clearFile}
              className="w-full sm:w-auto py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl border border-card text-muted hover:text-slate-900 dark:hover:text-white font-bold text-sm transition-colors"
            >
              Select Different File
            </button>
            <button
              type="button"
              onClick={executeSignAndDownload}
              disabled={!isFormValid || processing}
              title={isFormValid ? undefined : mode === "type" ? "Type your signature first" : "Draw your signature first"}
              className="w-full sm:flex-1 py-3.5 sm:py-4 px-4 rounded-2xl inline-flex items-center justify-center gap-2 text-white font-bold text-sm sm:text-base transition-colors shadow-lg bg-[#0d1322] border border-slate-700 hover:bg-[#131b2e] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#0d1322]"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin shrink-0" size={18} />
                  Signing Document...
                </>
              ) : (
                <>
                  <Download className="shrink-0" size={18} />
                  Download Signed PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <SecureNote />
    </div>
  );
}