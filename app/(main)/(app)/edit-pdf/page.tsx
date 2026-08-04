"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Edit3, Download, Loader2, Type, Bold, Italic, Pencil, Trash2, ChevronLeft, ChevronRight, Eraser, Move } from "lucide-react";

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
  const [drawColor, setDrawColor] = useState("#818cf8");
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
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/5">
          <Edit3 className="text-indigo-400" size={24} />
        </div>
        <h1 className="text-xl lg:text-2xl font-bold text-fg tracking-tight">Pro Interactive PDF Editor</h1>
        <p className="text-muted text-sm mt-1">Click anywhere on page to place text, or drag existing overlays.</p>
      </div>

      {!fileDetails ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); handleFile(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
            isDraggingFile 
              ? "border-indigo-500 bg-indigo-500/10" 
              : "border-card bg-card hover:border-[var(--primary)] shadow-xl"
          }`}
        >
          <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
            <Upload className="text-indigo-400" size={22} />
          </div>
          <p className="text-fg font-medium text-sm">Click to upload or drag & drop</p>
          <p className="text-muted text-xs mt-1">PDF documents up to 50MB</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card shadow-lg">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-fg text-sm truncate font-medium">{fileDetails.name}</p>
                <p className="text-muted text-xs">{fileDetails.size} • {pageCount} pages</p>
              </div>
              <button onClick={() => { setFileDetails(null); setRawFile(null); setAnnotations([]); setPdfDocProxy(null); }} className="text-muted hover:text-fg transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-1.5 rounded-xl bg-card border border-card flex gap-1 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTool("replace")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "replace" ? "bg-indigo-600 text-fg shadow-md shadow-indigo-600/20" : "text-muted hover:text-fg hover:bg-[var(--background-secondary)]"
                }`}
              >
                <Eraser size={13} /> Edit/Replace
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("text")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "text" ? "bg-indigo-600 text-fg shadow-md shadow-indigo-600/20" : "text-muted hover:text-fg hover:bg-[var(--background-secondary)]"
                }`}
              >
                <Type size={13} /> Add Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("draw")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "draw" ? "bg-indigo-600 text-fg shadow-md shadow-indigo-600/20" : "text-muted hover:text-fg hover:bg-[var(--background-secondary)]"
                }`}
              >
                <Pencil size={13} /> Draw
              </button>
            </div>

            {(activeTool === "replace" || activeTool === "text") && (
              <div className="p-4 rounded-2xl bg-card border border-card space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-fg">Text Properties</p>
                  {selectedTextAnn && (
                    <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
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
                    className="w-full p-2.5 rounded-xl border border-card bg-background text-fg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
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
                        className="w-full p-2 rounded-xl border border-card bg-background text-fg text-xs focus:outline-none focus:border-indigo-500"
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
                        className="w-full p-2 rounded-xl border border-card bg-background text-fg text-xs focus:outline-none focus:border-indigo-500"
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
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                        : "border-card bg-background text-muted hover:border-[var(--primary)]"
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
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                        : "border-card bg-background text-muted hover:border-[var(--primary)]"
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
                    className="h-8 w-12 rounded-lg border border-card cursor-pointer bg-background p-0.5"
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
                    className="w-full accent-indigo-500 cursor-pointer bg-[var(--background-secondary)] rounded-lg h-2"
                  />
                </div>
              </div>
            )}

            {activeTool === "draw" && (
              <div className="p-4 rounded-2xl bg-card border border-card space-y-3 shadow-lg">
                <p className="text-xs font-semibold text-fg">Drawing Properties</p>
                <div>
                  <label className="text-xs text-muted block mb-1">Color</label>
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-card cursor-pointer bg-background p-1"
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
                    className="w-full accent-indigo-500 cursor-pointer bg-[var(--background-secondary)] rounded-lg h-2"
                  />
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-card border border-card space-y-2 shadow-lg">
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
                          ? "bg-indigo-600/20 border border-indigo-500/50 text-indigo-200" 
                          : "bg-background border border-card text-fg hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="truncate pr-2 font-medium">
                        P{ann.pageIndex + 1}: {ann.type === "replace" ? `Replace → "${ann.newText}"` : ann.type === "text" ? `Text: "${ann.text}"` : "Draw Stroke"}
                      </span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id); }} className="text-rose-400 hover:text-rose-300 transition-colors p-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={executeSave}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-indigo-600 text-fg font-medium hover:bg-indigo-500 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {processing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {processing ? "Saving Changes..." : "Download Edited PDF"}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-card shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={selectedPageIndex === 0}
                    onClick={() => setSelectedPageIndex((p) => p - 1)}
                    className="p-1.5 rounded-lg bg-background border border-card text-fg disabled:opacity-40 hover:border-[var(--primary)] transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold text-fg">
                    Page {selectedPageIndex + 1} of {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={selectedPageIndex >= pageCount - 1}
                    onClick={() => setSelectedPageIndex((p) => p + 1)}
                    className="p-1.5 rounded-lg bg-background border border-card text-fg disabled:opacity-40 hover:border-[var(--primary)] transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <span className="text-xs text-muted">
                  Active Tool: <strong className="text-indigo-400 capitalize">{activeTool}</strong>
                </span>
              </div>

              <div
                onClick={handlePageClick}
                onMouseDown={startDrawing}
                onMouseMove={onMouseMoveContainer}
                onMouseUp={onMouseUpContainer}
                className={`relative w-full flex justify-center bg-background rounded-xl border border-card overflow-auto p-4 select-none shadow-inner ${
                  activeTool === "replace" || activeTool === "text" ? "cursor-crosshair" : activeTool === "draw" ? "cursor-crosshair" : "cursor-default"
                }`}
                style={{ minHeight: "500px" }}
              >
                <div className="relative shadow-2xl" ref={overlayContainerRef}>
                  <canvas ref={canvasRef} className="block rounded shadow-lg max-w-full" />

                  <div className="absolute inset-0">
                    
                    {/* Render Replace Text Boxes (Default White background background via bg-white style, and text color) */}
                    {annotations
                      .filter((a) => a.pageIndex === selectedPageIndex && a.type === "replace")
                      .map((ann) => {
                        const repAnn = ann as ReplaceAnnotation;
                        const isSelected = selectedAnnotationId === repAnn.id;
                        return (
                          <div
                            key={repAnn.id}
                            onMouseDown={(e) => startDragAnnotation(e, repAnn.id, repAnn.x, repAnn.y)}
                            className={`absolute bg-white flex items-center px-1 cursor-grab active:cursor-grabbing transition-shadow rounded-sm ${
                              isSelected ? "ring-2 ring-indigo-500 shadow-xl" : "border border-dashed border-card hover:border-indigo-500"
                            }`}
                            style={{
                              top: `${repAnn.y}px`,
                              left: `${repAnn.x}px`,
                              width: `${repAnn.width}px`,
                              height: `${repAnn.height}px`,
                              fontSize: `${repAnn.fontSize}px`,
                              fontWeight: repAnn.isBold ? "bold" : "normal",
                              fontStyle: repAnn.isItalic ? "italic" : "normal",
                              color: repAnn.color,
                            }}
                          >
                            <span className="truncate w-full">{repAnn.newText}</span>
                          </div>
                        );
                      })}

                    {/* Render Text Overlays */}
                    {annotations
                      .filter((a) => a.pageIndex === selectedPageIndex && a.type === "text")
                      .map((ann) => {
                        const textAnn = ann as TextAnnotation;
                        const isSelected = selectedAnnotationId === textAnn.id;
                        return (
                          <div
                            key={textAnn.id}
                            onMouseDown={(e) => startDragAnnotation(e, textAnn.id, textAnn.x, textAnn.y)}
                            className={`absolute px-1.5 py-0.5 rounded cursor-grab active:cursor-grabbing transition-shadow ${
                              isSelected ? "ring-2 ring-indigo-500 bg-white/90 shadow-xl" : "border border-dashed border-indigo-500/60 bg-white/80"
                            }`}
                            style={{
                              top: `${textAnn.y}px`,
                              left: `${textAnn.x}px`,
                              fontSize: `${textAnn.fontSize}px`,
                              fontWeight: textAnn.isBold ? "bold" : "normal",
                              fontStyle: textAnn.isItalic ? "italic" : "normal",
                              color: textAnn.color,
                            }}
                          >
                            {textAnn.text}
                          </div>
                        );
                      })}

                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {annotations
                        .filter((a) => a.pageIndex === selectedPageIndex && a.type === "draw")
                        .map((ann) => {
                          const drawAnn = ann as DrawAnnotation;
                          const points = drawAnn.path.map((p) => `${p.x},${p.y}`).join(" ");
                          return (
                            <polyline
                              key={drawAnn.id}
                              fill="none"
                              stroke={drawAnn.color}
                              strokeWidth={drawAnn.strokeWidth}
                              points={points}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          );
                        })}
                      {isDrawing && currentPath.length > 1 && (
                        <polyline
                          fill="none"
                          stroke={drawColor}
                          strokeWidth={strokeWidth}
                          points={currentPath.map((p) => `${p.x},${p.y}`).join(" ")}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}