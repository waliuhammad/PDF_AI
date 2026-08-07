"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Edit3, Download, Loader2, Type, Bold, Italic, Pencil, Trash2, ChevronLeft, ChevronRight, Eraser, Move, Sparkles, ShieldCheck } from "lucide-react";
import { UploadCard } from "@/components/tools/upload-card";

interface TextAnnotation {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  color: string;
  pageIndex: number;
}

interface ReplaceAnnotation {
  id: string;
  type: "replace";
  x: number;
  y: number;
  width: number;
  height: number;
  newText: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  color: string;
  pageIndex: number;
}

interface DrawAnnotation {
  id: string;
  type: "draw";
  path: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  pageIndex: number;
}

type Annotation = TextAnnotation | ReplaceAnnotation | DrawAnnotation;

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function EditPdfPage() {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  
  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<"text" | "replace" | "draw">("replace");
  
  // Text Options (Default Text Color set to #000000)
  const [newText, setNewText] = useState("");
  const [fontSize, setFontSize] = useState<number>(14);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  // Replace Text Tool Options
  const [replaceWidth, setReplaceWidth] = useState(120);
  const [replaceHeight, setReplaceHeight] = useState(22);

  // Draw Options
  const [drawColor, setDrawColor] = useState("#4f46e5");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Selection & Drag State for Elements
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [draggingAnnId, setDraggingAnnId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // Annotations Store
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
      };
      document.head.appendChild(script);
    } else if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") return;

    try {
      const arrayBuffer = await f.arrayBuffer();

      if (window.pdfjsLib) {
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDocProxy(pdf);
        setPageCount(pdf.numPages);
      }

      setRawFile(f);
      setFileDetails({ name: f.name, size: formatSize(f.size) });
      setSelectedPageIndex(0);
      setAnnotations([]);
      setErrorMessage(null);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setErrorMessage("Could not render PDF document.");
    }
  };

  useEffect(() => {
    if (!pdfDocProxy || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocProxy.getPage(selectedPageIndex + 1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1.2 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Canvas render error:", err);
      }
    };

    renderPage();
  }, [pdfDocProxy, selectedPageIndex]);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingAnnId || hasDragged || activeTool === "draw") {
      setHasDragged(false);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const textToAdd = newText.trim() || "Add text here...";

    if (activeTool === "replace") {
      const ann: ReplaceAnnotation = {
        id: Math.random().toString(36).substring(2, 9),
        type: "replace",
        x: x - replaceWidth / 2 > 0 ? x - replaceWidth / 2 : x,
        y: y - replaceHeight / 2 > 0 ? y - replaceHeight / 2 : y,
        width: replaceWidth,
        height: replaceHeight,
        newText: textToAdd,
        fontSize,
        isBold,
        isItalic,
        color: textColor,
        pageIndex: selectedPageIndex,
      };
      setAnnotations((prev) => [...prev, ann]);
      setSelectedAnnotationId(ann.id);
    } else if (activeTool === "text") {
      const ann: TextAnnotation = {
        id: Math.random().toString(36).substring(2, 9),
        type: "text",
        text: textToAdd,
        x,
        y,
        fontSize,
        isBold,
        isItalic,
        color: textColor,
        pageIndex: selectedPageIndex,
      };
      setAnnotations((prev) => [...prev, ann]);
      setSelectedAnnotationId(ann.id);
    }
  };

  const startDragAnnotation = (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    setDraggingAnnId(id);
    setHasDragged(false);

    if (overlayContainerRef.current) {
      const rect = overlayContainerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setDragOffset({ x: mouseX - currentX, y: mouseY - currentY });
    }
  };

  const onMouseMoveContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing && activeTool === "draw") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentPath((prev) => [...prev, { x, y }]);
      return;
    }

    if (!draggingAnnId || !overlayContainerRef.current) return;

    setHasDragged(true);
    const rect = overlayContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = Math.round(mouseX - dragOffset.x);
    const newY = Math.round(mouseY - dragOffset.y);

    setAnnotations((prev) =>
      prev.map((ann) => {
        if (ann.id === draggingAnnId) {
          return { ...ann, x: newX, y: newY } as Annotation;
        }
        return ann;
      })
    );
  };

  const onMouseUpContainer = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (currentPath.length > 1) {
        const ann: DrawAnnotation = {
          id: Math.random().toString(36).substring(2, 9),
          type: "draw",
          path: currentPath,
          color: drawColor,
          strokeWidth,
          pageIndex: selectedPageIndex,
        };
        setAnnotations((prev) => [...prev, ann]);
      }
      setCurrentPath([]);
    }
    setDraggingAnnId(null);
  };

  const startDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "draw") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  const selectedAnn = annotations.find((a) => a.id === selectedAnnotationId);
  const selectedTextAnn = selectedAnn && selectedAnn.type !== "draw" ? (selectedAnn as TextAnnotation | ReplaceAnnotation) : null;

  const updateSelectedAnnotation = (field: string, value: any) => {
    if (!selectedAnnotationId) return;
    setAnnotations((prev) =>
      prev.map((a) => {
        if (a.id === selectedAnnotationId) {
          return { ...a, [field]: value } as Annotation;
        }
        return a;
      })
    );
  };

  const executeSave = async () => {
    if (!rawFile) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", rawFile);
      formData.append("annotations", JSON.stringify(annotations));

      const response = await fetch("/api/edit-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || "Failed to save edited PDF.");
        setProcessing(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_${rawFile.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage("An error occurred while saving the document.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full text-fg">
      {!fileDetails ? (
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-card border border-card shadow-2xl transition-colors">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/10 dark:bg-slate-800 border border-slate-900/20 dark:border-slate-700 text-fg text-xs font-semibold mb-4 shadow-sm">
              <Sparkles size={13} className="text-slate-900 dark:text-slate-400" />
              DOCUMENT CONVERSION SUITE
            </div>
            <h1 className="text-3xl font-bold text-fg tracking-tight mb-2">Pro Interactive PDF Editor</h1>
            <p className="text-muted text-sm">Add text, replace content, or draw with precise positioning.</p>
          </div>

          {/* Drag & Drop Upload Card */}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card shadow-lg transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[var(--background-secondary)] border border-card flex items-center justify-center shrink-0">
                <FileText size={16} className="text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-fg text-sm truncate font-medium">{fileDetails.name}</p>
                <p className="text-muted text-xs">{fileDetails.size} • {pageCount} pages</p>
              </div>
              <button onClick={() => { setFileDetails(null); setRawFile(null); setAnnotations([]); setPdfDocProxy(null); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-1.5 rounded-xl bg-card border border-card flex gap-1 shadow-lg transition-colors">
              <button
                type="button"
                onClick={() => setActiveTool("replace")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "replace" ? "bg-slate-900 text-white dark:bg-slate-800 border border-slate-900 dark:border-slate-700 shadow-md" : "text-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <Eraser size={13} /> Edit/Replace
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("text")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "text" ? "bg-slate-900 text-white dark:bg-slate-800 border border-slate-900 dark:border-slate-700 shadow-md" : "text-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <Type size={13} /> Add Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("draw")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "draw" ? "bg-slate-900 text-white dark:bg-slate-800 border border-slate-900 dark:border-slate-700 shadow-md" : "text-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <Pencil size={13} /> Draw
              </button>
            </div>

            {(activeTool === "replace" || activeTool === "text") && (
              <div className="p-4 rounded-2xl bg-card border border-card space-y-3 shadow-lg transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-fg">Text Properties</p>
                  {selectedTextAnn && (
                    <span className="text-[10px] text-muted font-semibold flex items-center gap-1 bg-[var(--background-secondary)] px-2 py-0.5 rounded-full border border-card">
                      <Move size={10} /> Active Selected
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1">Text Content</label>
                  <input
                    type="text"
                    value={
                      selectedTextAnn
                        ? "newText" in selectedTextAnn
                          ? selectedTextAnn.newText
                          : selectedTextAnn.text
                        : newText
                    }
                    onChange={(e) => {
                      setNewText(e.target.value);
                      if (selectedTextAnn) {
                        updateSelectedAnnotation(
                          "newText" in selectedTextAnn ? "newText" : "text",
                          e.target.value
                        );
                      }
                    }}
                    placeholder="Write text here..."
                    className="w-full p-2.5 rounded-xl border border-card bg-card text-fg text-sm focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                  />
                </div>

                {activeTool === "replace" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted block mb-1">Whiteout Width</label>
                      <input
                        type="number"
                        value={
                          selectedTextAnn && "width" in selectedTextAnn
                            ? selectedTextAnn.width
                            : replaceWidth
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setReplaceWidth(val);
                          updateSelectedAnnotation("width", val);
                        }}
                        className="w-full p-2 rounded-xl border border-card bg-card text-fg text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Whiteout Height</label>
                      <input
                        type="number"
                        value={
                          selectedTextAnn && "height" in selectedTextAnn
                            ? selectedTextAnn.height
                            : replaceHeight
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setReplaceHeight(val);
                          updateSelectedAnnotation("height", val);
                        }}
                        className="w-full p-2 rounded-xl border border-card bg-card text-fg text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const next = selectedTextAnn ? !selectedTextAnn.isBold : !isBold;
                      setIsBold(next);
                      updateSelectedAnnotation("isBold", next);
                    }}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center flex-1 transition-all ${
                      (selectedTextAnn ? selectedTextAnn.isBold : isBold)
                        ? "border-slate-900 dark:border-slate-600 bg-slate-900 text-white dark:bg-slate-800"
                        : "border-card bg-card text-muted hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = selectedTextAnn ? !selectedTextAnn.isItalic : !isItalic;
                      setIsItalic(next);
                      updateSelectedAnnotation("isItalic", next);
                    }}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center flex-1 transition-all ${
                      (selectedTextAnn ? selectedTextAnn.isItalic : isItalic)
                        ? "border-slate-900 dark:border-slate-600 bg-slate-900 text-white dark:bg-slate-800"
                        : "border-card bg-card text-muted hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <Italic size={14} />
                  </button>
                  <input
                    type="color"
                    value={selectedTextAnn ? selectedTextAnn.color : textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      updateSelectedAnnotation("color", e.target.value);
                    }}
                    className="h-8 w-12 rounded-lg border border-card cursor-pointer bg-card p-0.5"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1">
                    Font Size: {selectedTextAnn ? selectedTextAnn.fontSize : fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    value={selectedTextAnn ? selectedTextAnn.fontSize : fontSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFontSize(val);
                      updateSelectedAnnotation("fontSize", val);
                    }}
                    className="w-full accent-slate-900 dark:accent-slate-400 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg h-2"
                  />
                </div>
              </div>
            )}

            {activeTool === "draw" && (
              <div className="p-4 rounded-2xl bg-card border border-card space-y-3 shadow-lg transition-colors">
                <p className="text-xs font-semibold text-fg">Drawing Properties</p>
                <div>
                  <label className="text-xs text-muted block mb-1">Color</label>
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-card cursor-pointer bg-card p-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Stroke Width: {strokeWidth}px</label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-slate-900 dark:accent-slate-400 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg h-2"
                  />
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-card border border-card space-y-2 shadow-lg transition-colors">
              <p className="text-xs font-semibold text-fg">Active Modifications ({annotations.length})</p>
              {annotations.length === 0 ? (
                <p className="text-xs text-muted">No edits made yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {annotations.map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => setSelectedAnnotationId(ann.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        selectedAnnotationId === ann.id 
                          ? "bg-slate-900 text-white dark:bg-slate-800 border border-slate-900 dark:border-slate-700" 
                          : "bg-card border border-card text-muted hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <span className="truncate pr-2 font-medium">
                        P{ann.pageIndex + 1}: {ann.type === "replace" ? `Replace → "${ann.newText}"` : ann.type === "text" ? `Text: "${ann.text}"` : "Draw Stroke"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAnnotation(ann.id);
                        }}
                        className={`text-slate-400 hover:text-red-600 dark:hover:text-red-400 ${selectedAnnotationId === ann.id ? "text-slate-300" : ""}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={executeSave}
              disabled={processing || annotations.length === 0}
              className="w-full py-3 rounded-xl bg-slate-900 text-white dark:bg-[var(--card)] border border-slate-900 dark:border-slate-700 font-medium hover:bg-slate-800 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm"
            >
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Save & Download PDF
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 flex flex-col items-center bg-card p-4 rounded-2xl border border-card shadow-xl transition-colors">
            <div className="flex items-center justify-between w-full mb-3 px-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedPageIndex === 0}
                  onClick={() => setSelectedPageIndex((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-[var(--card)] border border-slate-900 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-800 dark:hover:border-slate-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-muted font-medium">
                  Page {selectedPageIndex + 1} of {pageCount}
                </span>
                <button
                  type="button"
                  disabled={selectedPageIndex >= pageCount - 1}
                  onClick={() => setSelectedPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                  className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-[var(--card)] border border-slate-900 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-800 dark:hover:border-slate-700 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <span className="text-[11px] text-muted">
                {activeTool === "draw" ? "Click & drag to draw" : "Click anywhere on page to place"}
              </span>
            </div>

            <div className="relative border border-card bg-card rounded-xl overflow-auto max-h-[650px] shadow-inner flex justify-center w-full transition-colors">
              <div
                ref={overlayContainerRef}
                onClick={handlePageClick}
                onMouseDown={startDrawing}
                onMouseMove={onMouseMoveContainer}
                onMouseUp={onMouseUpContainer}
                className="relative cursor-crosshair inline-block"
              >
                <canvas ref={canvasRef} className="block" />

                {annotations
                  .filter((ann) => ann.pageIndex === selectedPageIndex)
                  .map((ann) => {
                    if (ann.type === "draw") {
                      const svgPoints = ann.path.map((p) => `${p.x},${p.y}`).join(" ");
                      return (
                        <svg key={ann.id} className="absolute inset-0 pointer-events-none w-full h-full">
                          <polyline
                            fill="none"
                            stroke={ann.color}
                            strokeWidth={ann.strokeWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={svgPoints}
                          />
                        </svg>
                      );
                    }

                    const isSelected = selectedAnnotationId === ann.id;

                    if (ann.type === "replace") {
                      return (
                        <div
                          key={ann.id}
                          onMouseDown={(e) => startDragAnnotation(e, ann.id, ann.x, ann.y)}
                          style={{
                            position: "absolute",
                            left: `${ann.x}px`,
                            top: `${ann.y}px`,
                            width: `${ann.width}px`,
                            height: `${ann.height}px`,
                          }}
                          className={`flex items-center bg-white px-1 select-none cursor-move group ${
                            isSelected ? "ring-2 ring-slate-900 dark:ring-slate-400 shadow-md" : "border border-dashed border-slate-400/60"
                          }`}
                        >
                          <span
                            style={{
                              fontSize: `${ann.fontSize}px`,
                              fontWeight: ann.isBold ? "bold" : "normal",
                              fontStyle: ann.isItalic ? "italic" : "normal",
                              color: ann.color,
                              lineHeight: 1,
                            }}
                            className="truncate pointer-events-none"
                          >
                            {ann.newText}
                          </span>
                        </div>
                      );
                    }

                    if (ann.type === "text") {
                      return (
                        <div
                          key={ann.id}
                          onMouseDown={(e) => startDragAnnotation(e, ann.id, ann.x, ann.y)}
                          style={{
                            position: "absolute",
                            left: `${ann.x}px`,
                            top: `${ann.y}px`,
                          }}
                          className={`px-1.5 py-0.5 select-none cursor-move rounded ${
                            isSelected ? "ring-2 ring-slate-900 dark:ring-slate-400 bg-slate-200/40 dark:bg-slate-800/40 shadow-md" : "hover:bg-slate-200/20 dark:hover:bg-slate-800/20 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <span
                            style={{
                              fontSize: `${ann.fontSize}px`,
                              fontWeight: ann.isBold ? "bold" : "normal",
                              fontStyle: ann.isItalic ? "italic" : "normal",
                              color: ann.color,
                            }}
                            className="pointer-events-none whitespace-nowrap block"
                          >
                            {ann.text}
                          </span>
                        </div>
                      );
                    }

                    return null;
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}