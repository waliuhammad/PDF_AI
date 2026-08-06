"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Download,
  Type,
  Image as ImageIcon,
  Grid,
  Eye,
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  Circle,
  ArrowRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import type * as PdfjsLib from "pdfjs-dist";
import { loadPdfjs } from "@/lib/pdf-libs";

type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export default function WatermarkPdfPage() {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Watermark Type Options
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");

  // Text Watermark Configuration
  const [text, setText] = useState("CONFIDENTIAL");
  const [textColor, setTextColor] = useState("#ef4444");
  const [bgColor, setBgColor] = useState("#fee2e2");
  const [useBgColor, setUseBgColor] = useState(true);
  const [fontSize, setFontSize] = useState<number>(42);
  const [isTiled, setIsTiled] = useState(false);

  // Image Watermark Configuration
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState<number>(0.3);

  // Layout & Visibility Controls
  const [position, setPosition] = useState<Position>("center");
  const [visibilityMode, setVisibilityMode] = useState<"transparent" | "visible">("transparent");
  const [opacity, setOpacity] = useState<number>(0.35);
  const [rotation, setRotation] = useState<number>(45);

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  // PDF Preview State
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<PdfjsLib.PDFDocumentProxy | null>(null);
  const [renderedPages, setRenderedPages] = useState<{ [pageNumber: number]: string } | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handlePdfFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF document.");
      return;
    }

    setRawFile(f);
    setErrorMessage(null);
    setSuccessMessage(false);
    setRenderedPages(null);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfjsLib = await loadPdfjs();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const loadedPdf = await loadingTask.promise;
      setPdfDoc(loadedPdf);
      setNumPages(loadedPdf.numPages);
    } catch (err) {
      console.error("Error loading PDF for preview:", err);
      setErrorMessage("Failed to load PDF preview layout.");
    }
  };

  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    let isCancelled = false;

    const renderAllPages = async () => {
      setIsRendering(true);
      const pagesMap: { [pageNumber: number]: string } = {};

      try {
        for (let i = 1; i <= numPages; i++) {
          if (isCancelled) break;
          const page = await pdfDoc.getPage(i);
          
          const baseScale = 0.15;
          const upscaleFactor = 4.0;
          const viewport = page.getViewport({ scale: baseScale * upscaleFactor });
          
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          pagesMap[i] = canvas.toDataURL();
        }

        if (!isCancelled) {
          setRenderedPages(pagesMap);
        }
      } catch (err) {
        console.error("Pages render error:", err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    };

    renderAllPages();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, numPages]);

  const clearFile = () => {
    setRawFile(null);
    setErrorMessage(null);
    setSuccessMessage(false);
    setPdfDoc(null);
    setNumPages(0);
    setRenderedPages(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleImageFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const img = fileList[0];
    if (!["image/png", "image/jpeg", "image/jpg"].includes(img.type)) {
      setErrorMessage("Please select a PNG or JPG image.");
      return;
    }
    setWatermarkImage(img);
    setImagePreview(URL.createObjectURL(img));
    setErrorMessage(null);
  };

  const handleVisibilityChange = (mode: "transparent" | "visible") => {
    setVisibilityMode(mode);
    setOpacity(mode === "visible" ? 1.0 : 0.35);
  };

  const executeApplyWatermark = async () => {
    if (!rawFile) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", rawFile);
      formData.append("type", watermarkType);
      formData.append("opacity", opacity.toString());
      formData.append("rotation", rotation.toString());
      formData.append("position", position);

      if (watermarkType === "text") {
        formData.append("text", text);
        formData.append("textColor", textColor);
        formData.append("bgColor", useBgColor ? bgColor : "");
        formData.append("fontSize", fontSize.toString());
        formData.append("isTiled", isTiled.toString());
      } else {
        if (!watermarkImage) {
          setErrorMessage("Please select an image for the watermark.");
          setProcessing(false);
          return;
        }
        formData.append("image", watermarkImage);
        formData.append("imageScale", imageScale.toString());
      }

      const response = await fetch("/api/watermark-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || "Failed to apply watermark.");
        setProcessing(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const originalNameWithoutExt = rawFile.name.replace(/\.[^/.]+$/, "");
      a.download = `${originalNameWithoutExt}_watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(true);
    } catch {
      setErrorMessage("An error occurred while creating the watermark.");
    } finally {
      setProcessing(false);
    }
  };

  const positionsList: { id: Position; label: string; icon: React.ElementType }[] = [
    { id: "top-left", label: "Top Left", icon: ArrowUpLeft },
    { id: "top-center", label: "Top Center", icon: ArrowUp },
    { id: "top-right", label: "Top Right", icon: ArrowUpRight },
    { id: "center-left", label: "Center Left", icon: ArrowLeft },
    { id: "center", label: "Center", icon: Circle },
    { id: "center-right", label: "Center Right", icon: ArrowRight },
    { id: "bottom-left", label: "Bottom Left", icon: ArrowDownLeft },
    { id: "bottom-center", label: "Bottom Center", icon: ArrowDown },
    { id: "bottom-right", label: "Bottom Right", icon: ArrowDownRight },
  ];

  return (
    <div className="min-h-[85vh] bg-white dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start py-8 px-4 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Main Outer Card Wrapper using system dark/light mode classes */}
        <div className="bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-[#252036] rounded-3xl p-8 shadow-xl dark:shadow-2xl dark:shadow-black/60 relative overflow-hidden transition-colors duration-200">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 border bg-slate-100 dark:bg-purple-950/60 text-slate-900 dark:text-purple-300 border-slate-200 dark:border-purple-800/60">
              <Sparkles size={13} /> DOCUMENT CONVERSION SUITE
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">PDF Watermark Tool</h1>
            <p className="text-sm mt-1.5 text-slate-600 dark:text-purple-300/70">Add text or image watermarks with precise positioning.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          {!rawFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); handlePdfFile(e.dataTransfer.files); }}
              onClick={() => pdfInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
                isDraggingFile
                  ? "border-purple-500 bg-purple-500/5"
                  : "border-slate-300 dark:border-[#2d2745] bg-slate-50 dark:bg-[#141824] hover:border-slate-400 dark:hover:border-purple-500/50 hover:bg-slate-100/60 dark:hover:bg-[#181d2c]"
              }`}
            >
              <input ref={pdfInputRef} type="file" accept="application/pdf" hidden onChange={(e) => handlePdfFile(e.target.files)} />
              <div className="w-14 h-14 mx-auto rounded-2xl border flex items-center justify-center mb-4 bg-white dark:bg-purple-950/60 border-slate-200 dark:border-purple-800/60 text-slate-900 dark:text-purple-300">
                <Upload size={24} />
              </div>
              <p className="font-semibold text-base text-slate-900 dark:text-white">Click to upload PDF document</p>
              <p className="text-xs mt-1.5 text-slate-600 dark:text-purple-300/70">Supports text documents and reports</p>

              <div className="mt-8 pt-4 border-t flex items-center justify-center gap-2 text-xs border-slate-200 dark:border-[#2b2545] text-slate-600 dark:text-purple-300/60">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure PDF text extraction • No file retention
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Controls Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-white dark:bg-purple-950/60 border-slate-200 dark:border-purple-800/60 text-slate-900 dark:text-purple-300">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-200">{rawFile.name}</p>
                    <p className="text-xs text-slate-600 dark:text-purple-300/70">
                      {formatSize(rawFile.size)} • {numPages} {numPages === 1 ? 'Page' : 'Pages'}
                    </p>
                  </div>
                  <button onClick={clearFile} className="p-1 text-slate-400 dark:text-purple-300/60 hover:text-slate-900 dark:hover:text-white">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Type Switcher */}
                <div className="p-1 rounded-2xl border flex gap-1 bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] shadow-sm">
                  <button
                    type="button"
                    onClick={() => setWatermarkType("text")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      watermarkType === "text"
                        ? "bg-slate-900 dark:bg-[#362758] text-white shadow-sm dark:shadow-md border border-slate-900 dark:border-purple-500/40 font-bold"
                        : "text-slate-600 dark:text-purple-300/70 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Type size={14} /> Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatermarkType("image")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      watermarkType === "image"
                        ? "bg-slate-900 dark:bg-[#362758] text-white shadow-sm dark:shadow-md border border-slate-900 dark:border-purple-500/40 font-bold"
                        : "text-slate-600 dark:text-purple-300/70 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <ImageIcon size={14} /> Image
                  </button>
                </div>

                {/* Visibility Mode Switcher */}
                <div className="p-4 rounded-2xl border space-y-2 bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] shadow-sm">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-900 dark:text-purple-300">
                    <Eye size={13} className="text-slate-900 dark:text-purple-400" /> Visibility Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange("transparent")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        visibilityMode === "transparent"
                          ? "border-slate-900 dark:border-purple-500/60 bg-white dark:bg-[#362758]/50 text-slate-900 dark:text-purple-200 font-bold dark:font-semibold shadow-sm"
                          : "border-slate-200 dark:border-[#2b2545] bg-slate-50 dark:bg-[#141824] text-slate-600 dark:text-purple-300/70 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      Transparent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange("visible")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        visibilityMode === "visible"
                          ? "border-slate-900 dark:border-purple-500/60 bg-white dark:bg-[#362758]/50 text-slate-900 dark:text-purple-200 font-bold dark:font-semibold shadow-sm"
                          : "border-slate-200 dark:border-[#2b2545] bg-slate-50 dark:bg-[#141824] text-slate-600 dark:text-purple-300/70 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      Fully Visible
                    </button>
                  </div>
                </div>

                {/* Position Grid Options */}
                {!isTiled && (
                  <div className="p-4 rounded-2xl border space-y-2 bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] shadow-sm">
                    <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-900 dark:text-purple-300">
                      <Grid size={13} className="text-slate-900 dark:text-purple-400" /> Position
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 max-w-[160px] mx-auto pt-1">
                      {positionsList.map((pos) => {
                        const Icon = pos.icon;
                        const isActive = position === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            title={pos.label}
                            onClick={() => setPosition(pos.id)}
                            className={`h-10 rounded-xl border flex items-center justify-center transition-all ${
                              isActive
                                ? "bg-slate-900 dark:bg-[#581c87] text-white border-slate-900 dark:border-purple-500 shadow-md"
                                : "bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] text-slate-600 dark:text-purple-300/70 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Text Config Options */}
                {watermarkType === "text" && (
                  <div className="p-4 rounded-2xl border space-y-3 bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] shadow-sm">
                    <p className="text-xs font-semibold text-slate-900 dark:text-purple-300">Text Settings</p>

                    <div>
                      <label className="text-xs block mb-1 text-slate-600 dark:text-purple-300/70">Watermark Text</label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="CONFIDENTIAL"
                        className="w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:border-slate-900 dark:focus:border-purple-500 border-slate-200 dark:border-[#2b2545] bg-white dark:bg-[#141824] text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs block mb-1 text-slate-600 dark:text-purple-300/70">Text Color</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-9 rounded-xl border cursor-pointer p-1 border-slate-200 dark:border-[#2b2545] bg-white dark:bg-[#141824]"
                        />
                      </div>
                      <div>
                        <label className="text-xs block mb-1 text-slate-600 dark:text-purple-300/70">Background/Border</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            disabled={!useBgColor}
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full h-9 rounded-xl border cursor-pointer p-1 disabled:opacity-40 border-slate-200 dark:border-[#2b2545] bg-white dark:bg-[#141824]"
                          />
                          <input
                            type="checkbox"
                            checked={useBgColor}
                            onChange={(e) => setUseBgColor(e.target.checked)}
                            className="w-4 h-4 accent-slate-900 dark:accent-purple-600 cursor-pointer rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs block mb-1 text-slate-600 dark:text-purple-300/70">Font Size: {fontSize}px</label>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-slate-900 dark:accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-slate-900 dark:text-purple-200">
                        <input
                          type="checkbox"
                          checked={isTiled}
                          onChange={(e) => setIsTiled(e.target.checked)}
                          className="w-4 h-4 accent-slate-900 dark:accent-purple-600 rounded cursor-pointer"
                        />
                        <Grid size={14} className="text-slate-500 dark:text-purple-300/60" /> Tile pattern across page
                      </label>
                    </div>
                  </div>
                )}

                {/* Image Config Options */}
                {watermarkType === "image" && (
                  <div className="p-4 rounded-2xl border space-y-3 bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] shadow-sm">
                    <p className="text-xs font-semibold text-slate-900 dark:text-purple-300">Image Settings</p>

                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="cursor-pointer border border-dashed rounded-xl p-4 text-center transition-colors border-slate-300 dark:border-[#2b2545] hover:border-slate-400 dark:hover:border-purple-500 bg-white dark:bg-[#141824]"
                    >
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        hidden
                        onChange={(e) => handleImageFile(e.target.files)}
                      />
                      {imagePreview ? (
                        <div className="flex flex-col items-center gap-2">
                          {/* Fixed box: without a width the drop zone resized to
                              whatever shape of logo was picked. */}
                          <img src={imagePreview} alt="Watermark Preview" className="h-16 w-32 object-contain rounded" />
                          <span className="text-xs text-slate-900 dark:text-purple-400 font-medium">Change Image</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 dark:text-purple-300/70">
                          <ImageIcon className="mx-auto mb-1 text-slate-400 dark:text-purple-300/50" size={20} />
                          Click to upload PNG/JPG logo
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs block mb-1 text-slate-600 dark:text-purple-300/70">Image Size: {Math.round(imageScale * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full accent-slate-900 dark:accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Watermark applied & downloaded successfully!
                  </div>
                )}

                {/* Apply Button */}
                <button
                  type="button"
                  disabled={processing}
                  onClick={executeApplyWatermark}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-slate-900 hover:bg-slate-800 dark:bg-[#581c87] dark:hover:bg-[#6b21a8] shadow-slate-900/20 dark:shadow-purple-950/60 border border-slate-800 dark:border-purple-500/30 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Applying Watermark...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Apply & Download PDF
                    </>
                  )}
                </button>
              </div>

              {/* Preview Column */}
              <div className="rounded-2xl border p-6 flex flex-col items-center justify-center relative min-h-[400px] overflow-hidden lg:col-span-2 bg-white dark:bg-[#141824] border-slate-200 dark:border-[#2b2545] shadow-sm">
                <div className="absolute top-4 left-4 text-xs font-medium flex items-center gap-1.5 text-slate-600 dark:text-purple-300/70">
                  <Sparkles size={13} className="text-slate-900 dark:text-purple-400" /> Document Pages Preview
                </div>

                {isRendering && !renderedPages && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-slate-900 dark:text-purple-400" size={32} />
                  </div>
                )}

                <div className="max-h-[380px] max-w-[300px] w-full overflow-y-auto flex flex-col items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-black/10 border border-slate-200 dark:border-[#2b2545] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-purple-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {renderedPages && Object.keys(renderedPages).length > 0 ? (
                    Object.entries(renderedPages).map(([pageNum, dataUrl]) => (
                      <div key={pageNum} className="relative flex flex-col items-center w-full group">
                        <div className="relative w-full shadow-lg rounded bg-white overflow-hidden border border-slate-200">
                          <img
                            src={dataUrl}
                            alt={`Page ${pageNum}`}
                            className="w-full h-auto object-contain block"
                          />
                          {/* Live Watermark Overlay positioned over rendered pages */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            {watermarkType === "text" ? (
                              <div
                                className="font-bold select-none text-center"
                                style={{
                                  color: textColor,
                                  opacity: opacity,
                                  fontSize: `${fontSize * 0.45}px`,
                                  transform: `rotate(${rotation}deg)`,
                                }}
                              >
                                {text || "WATERMARK"}
                              </div>
                            ) : imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Watermark"
                                className="select-none object-contain"
                                style={{
                                  opacity: opacity,
                                  width: `${imageScale * 120}px`,
                                  transform: `rotate(${rotation}deg)`,
                                }}
                              />
                            ) : null}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Page {pageNum}</span>
                      </div>
                    ))
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <Loader2 className="animate-spin text-slate-900 dark:text-purple-400" size={28} />
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}