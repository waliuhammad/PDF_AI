"use client";

import { useState, useRef } from "react";
import {
  Upload, FileText, X, Stamp, Download, Loader2, Type, Image as ImageIcon, Grid, RotateCw, Eye, LayoutGrid, Sun,
  ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, Circle, ArrowRight, ArrowDownLeft, ArrowDown, ArrowDownRight, ShieldCheck, Sparkles
} from "lucide-react";

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
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Watermark Type
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");

  // Text Watermark Options
  const [text, setText] = useState("CONFIDENTIAL");
  const [textColor, setTextColor] = useState("#ef4444");
  const [bgColor, setBgColor] = useState("#fee2e2");
  const [useBgColor, setUseBgColor] = useState(true);
  const [fontSize, setFontSize] = useState<number>(42);
  const [isTiled, setIsTiled] = useState(false);

  // Image Watermark Options
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

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handlePdfFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") return;

    setRawFile(f);
    setFileDetails({ name: f.name, size: formatSize(f.size) });
    setErrorMessage(null);
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
      a.download = `watermarked_${rawFile.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage("An error occurred while creating the watermark.");
    } finally {
      setProcessing(false);
    }
  };

  const getPreviewAlignment = () => {
    if (isTiled) return "items-center justify-center";
    switch (position) {
      case "top-left":
        return "items-start justify-start p-6";
      case "top-center":
        return "items-start justify-center pt-6";
      case "top-right":
        return "items-start justify-end p-6";
      case "center-left":
        return "items-center justify-start pl-6";
      case "center-right":
        return "items-center justify-end pr-6";
      case "bottom-left":
        return "items-end justify-start p-6";
      case "bottom-center":
        return "items-end justify-center pb-6";
      case "bottom-right":
        return "items-end justify-end p-6";
      default:
        return "items-center justify-center";
    }
  };

  const positionsList: { id: Position; label: string; icon: any }[] = [
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
    <div className="min-h-[85vh] bg-background text-fg flex flex-col items-center justify-start py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Outer Card Wrapper */}
        <div className="bg-card border border-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Header section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20">
              <Sparkles size={13} /> PROFESSIONAL PDF TOOLKIT
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-fg">PDF Watermark Tool</h1>
            <p className="text-muted text-sm mt-1.5">Add text or image watermarks with precise positioning.</p>
          </div>

          {!fileDetails ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); handlePdfFile(e.dataTransfer.files); }}
              onClick={() => pdfInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
                isDraggingFile ? "border-blue-500 bg-blue-500/5" : "border-card bg-[var(--background-secondary)] hover:border-[var(--primary)] hover:bg-[var(--background-secondary)]"
              }`}
            >
              <input ref={pdfInputRef} type="file" accept="application/pdf" hidden onChange={(e) => handlePdfFile(e.target.files)} />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                <Upload size={24} />
              </div>
              <p className="text-fg font-semibold text-base">Click to upload or drag & drop</p>
              <p className="text-muted text-xs mt-1.5">PDF documents up to 50MB</p>

              <div className="mt-8 pt-4 border-t border-card flex items-center justify-center gap-2 text-xs text-muted">
                <ShieldCheck size={14} className="text-emerald-400" /> Secure processing • Files processed privately
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Controls Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--background-secondary)] border border-card">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <FileText size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-fg text-sm font-medium truncate">{fileDetails.name}</p>
                    <p className="text-muted text-xs">{fileDetails.size}</p>
                  </div>
                  <button onClick={() => { setFileDetails(null); setRawFile(null); }} className="text-muted hover:text-fg p-1">
                    <X size={16} />
                  </button>
                </div>

                {/* Type Switcher */}
                <div className="p-1 rounded-2xl bg-[var(--background-secondary)] border border-card flex gap-1">
                  <button
                    type="button"
                    onClick={() => setWatermarkType("text")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      watermarkType === "text" ? "bg-blue-600 text-fg shadow-lg shadow-blue-600/20" : "text-muted hover:text-fg"
                    }`}
                  >
                    <Type size={14} /> Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatermarkType("image")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      watermarkType === "image" ? "bg-blue-600 text-fg shadow-lg shadow-blue-600/20" : "text-muted hover:text-fg"
                    }`}
                  >
                    <ImageIcon size={14} /> Image
                  </button>
                </div>

                {/* Visibility Mode Switcher */}
                <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-card space-y-2">
                  <label className="text-xs font-semibold text-fg flex items-center gap-1.5">
                    <Sun size={13} className="text-blue-400" /> Visibility Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange("transparent")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        visibilityMode === "transparent"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400 font-semibold"
                          : "border-card bg-card text-muted hover:text-fg"
                      }`}
                    >
                      Transparent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange("visible")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        visibilityMode === "visible"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400 font-semibold"
                          : "border-card bg-card text-muted hover:text-fg"
                      }`}
                    >
                      Fully Visible
                    </button>
                  </div>
                </div>

                {/* 3x3 Arrow Position Grid */}
                {!isTiled && (
                  <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-card space-y-2">
                    <label className="text-xs font-semibold text-fg flex items-center gap-1.5">
                      <LayoutGrid size={13} className="text-blue-400" /> Position
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
                                ? "bg-blue-600 text-fg border-blue-500 shadow-md shadow-blue-600/20"
                                : "bg-card border-card text-muted hover:text-fg"
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
                  <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-card space-y-3">
                    <p className="text-xs font-semibold text-fg">Text Settings</p>

                    <div>
                      <label className="text-xs text-muted block mb-1">Watermark Text</label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="CONFIDENTIAL"
                        className="w-full p-2.5 rounded-xl border border-card bg-card text-fg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted block mb-1">Text Color</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-9 rounded-xl border border-card cursor-pointer bg-card p-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted block mb-1">Background/Border</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            disabled={!useBgColor}
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full h-9 rounded-xl border border-card cursor-pointer bg-card p-1 disabled:opacity-40"
                          />
                          <input
                            type="checkbox"
                            checked={useBgColor}
                            onChange={(e) => setUseBgColor(e.target.checked)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted block mb-1">Font Size: {fontSize}px</label>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-2 text-xs text-fg cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isTiled}
                          onChange={(e) => setIsTiled(e.target.checked)}
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        />
                        <Grid size={14} className="text-muted" /> Tile pattern across page
                      </label>
                    </div>
                  </div>
                )}

                {/* Image Config Options */}
                {watermarkType === "image" && (
                  <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-card space-y-3">
                    <p className="text-xs font-semibold text-fg">Image Settings</p>

                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="cursor-pointer border border-dashed border-card rounded-xl p-4 text-center hover:border-blue-500 bg-card transition-colors"
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
                          <img src={imagePreview} alt="Watermark Preview" className="h-16 object-contain rounded" />
                          <span className="text-xs text-blue-400 font-medium">Change Image</span>
                        </div>
                      ) : (
                        <div className="text-muted text-xs">
                          <ImageIcon className="mx-auto mb-1 text-muted" size={20} />
                          Click to upload PNG/JPG logo
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-muted block mb-1">Image Size: {Math.round(imageScale * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Sliders */}
                <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-card space-y-3">
                  <p className="text-xs font-semibold text-fg">Fine-Tuning Options</p>

                  <div>
                    <label className="text-xs text-muted block mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1 flex items-center gap-1">
                      <RotateCw size={12} className="text-muted" /> Rotation Angle: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={executeApplyWatermark}
                  disabled={processing}
                  className="w-full py-3.5 rounded-xl bg-blue-600 text-fg font-medium hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  {processing ? "Watermarking..." : "Download Watermarked PDF"}
                </button>
              </div>

              {/* Canvas Preview Column */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-8 rounded-2xl bg-[var(--background-secondary)] border border-card min-h-[420px]">
                <div className="flex items-center gap-1.5 text-xs text-muted mb-6 font-medium">
                  <Eye size={14} className="text-blue-400" /> Live Page Watermark Preview
                </div>

                <div className="relative w-72 h-96 bg-white rounded-xl shadow-2xl border border-card overflow-hidden flex flex-col p-5 select-none">
                  <div className="space-y-2.5 opacity-20">
                    <div className="h-3 bg-[var(--background-secondary)] rounded w-3/4"></div>
                    <div className="h-2 bg-slate-600 rounded w-full"></div>
                    <div className="h-2 bg-slate-600 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-600 rounded w-4/5"></div>
                    <div className="h-2 bg-slate-600 rounded w-full"></div>
                  </div>

                  {/* Precise Position Preview Box */}
                  <div className={`absolute inset-0 flex ${getPreviewAlignment()} overflow-hidden pointer-events-none`}>
                    {watermarkType === "text" ? (
                      isTiled ? (
                        <div
                          className="grid grid-cols-2 gap-8 transform"
                          style={{
                            transform: `rotate(${rotation}deg)`,
                            opacity: opacity,
                          }}
                        >
                          {[...Array(6)].map((_, i) => (
                            <span
                              key={i}
                              className="font-bold whitespace-nowrap px-2 py-1 rounded"
                              style={{
                                color: textColor,
                                backgroundColor: useBgColor ? bgColor : "transparent",
                                fontSize: `${fontSize * 0.4}px`,
                              }}
                            >
                              {text || "WATERMARK"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span
                          className="font-bold whitespace-nowrap px-3 py-1.5 rounded transition-all"
                          style={{
                            transform: `rotate(${rotation}deg)`,
                            color: textColor,
                            backgroundColor: useBgColor ? bgColor : "transparent",
                            opacity: opacity,
                            fontSize: `${fontSize * 0.45}px`,
                          }}
                        >
                          {text || "WATERMARK"}
                        </span>
                      )
                    ) : imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Watermark"
                        className="object-contain transition-all"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          opacity: opacity,
                          width: `${imageScale * 100}%`,
                        }}
                      />
                    ) : (
                      <span className="text-xs text-muted font-medium bg-[var(--background-secondary)] px-3 py-1.5 rounded-lg border border-card">Upload image to preview</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}