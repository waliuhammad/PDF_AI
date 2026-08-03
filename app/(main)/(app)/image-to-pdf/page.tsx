"use client";

<<<<<<< HEAD
import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Download, GripVertical } from "lucide-react";

interface UploadedImage {
    id: string;
    name: string;
    size: string;
    preview: string;
}

export default function ImageToPdfPage() {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragItemIndex = useRef<number | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const addFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        const imgFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
        const newImages: UploadedImage[] = imgFiles.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: formatSize(file.size),
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
        setDone(false);
    };

    const removeImage = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setDone(false);
    };

    const handleDragStart = (index: number) => (dragItemIndex.current = index);
    const handleDragEnter = (index: number) => {
        if (dragItemIndex.current === null || dragItemIndex.current === index) return;
        setImages((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(dragItemIndex.current!, 1);
            updated.splice(index, 0, moved);
            dragItemIndex.current = index;
            return updated;
        });
    };

    const handleConvert = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-0">
            <div className="text-center mb-8 sm:mb-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <ImageIcon className="text-[var(--primary)]" size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-fg">Image to PDF</h1>
                <p className="text-muted text-sm mt-1 px-2 sm:px-0">Combine your images into a single PDF file.</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                    }`}
            >
                <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
                <Upload className="mx-auto text-muted mb-3" size={28} />
                <p className="text-fg font-medium text-sm">Drag & drop images here</p>
                <p className="text-muted text-xs mt-1">or tap to browse — JPG, PNG, WEBP, and more supported</p>
            </div>

            {images.length > 0 && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={() => (dragItemIndex.current = null)}
                            className="relative group rounded-xl overflow-hidden border border-card bg-card cursor-grab active:cursor-grabbing"
                        >
                            <img src={img.preview} alt={img.name} className="w-full h-24 object-cover" />
                            <div className="absolute top-1 left-1 bg-black/50 rounded p-0.5">
                                <GripVertical size={12} className="text-white" />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                {index + 1}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {images.length > 0 && (
                <div className="mt-8 text-center">
                    {!done ? (
                        <button
                            onClick={handleConvert}
                            disabled={processing}
                            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                        >
                            {processing ? "Converting..." : `Convert ${images.length} Image${images.length > 1 ? "s" : ""} to PDF`}
                        </button>
                    ) : (
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                            <Download size={18} />
                            Download PDF
                        </button>
                    )}
                </div>
            )}
        </div>
    );
=======
import React, { useState, useRef, JSX } from "react";
import { FileText, Trash2, Download, UploadCloud, ShieldCheck, Sparkles, Loader2, Image as ImageIcon, Layers, Plus, Sliders, Type } from "lucide-react";
import { jsPDF } from "jspdf";

interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  color: string;
}

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  xPos: number;
  yPos: number;
  texts: TextAnnotation[];
}

export default function ImageToPdf(): JSX.Element {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [conversionType, setConversionType] = useState<"single" | "multi">("single");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>, isAppending: boolean = false): void => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      const loadFilesAsync = async () => {
        const validImages: ImageFile[] = [];

        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          if (file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(file.name)) {
            const previewUrl = URL.createObjectURL(file);
            
            const dims = await new Promise<{ w: number; h: number }>((resolve) => {
              const img = new window.Image();
              img.src = previewUrl;
              img.onload = () => resolve({ w: img.width, h: img.height });
              img.onerror = () => resolve({ w: 500, h: 500 });
            });

            const defaultW = 140;
            const defaultH = (dims.h / dims.w) * defaultW;
            const pageNumberLabel = images.length + i + 1;

            validImages.push({
              id: Math.random().toString(36).substring(2, 9),
              file,
              previewUrl,
              width: Number(defaultW.toFixed(1)),
              height: Number(defaultH.toFixed(1)),
              xPos: 35,
              yPos: 20,
              texts: [
                {
                  id: Math.random().toString(36).substring(2, 9),
                  text: `Image Caption ${pageNumberLabel}`,
                  x: 35,
                  y: 12,
                  fontSize: 14,
                  fontFamily: "helvetica",
                  isBold: true,
                  isItalic: false,
                  color: "#000000",
                },
              ],
            });
          }
        }

        if (validImages.length === 0) {
          setError("Please upload valid image files (PNG, JPG, WebP, BMP, GIF).");
          return;
        }

        setError(null);

        if (conversionType === "single" || !isAppending) {
          images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
          setImages([validImages[0]]);
          setSelectedImageId(validImages[0].id);
        } else {
          setImages((prev) => {
            const updated = [...prev, ...validImages];
            if (!selectedImageId && updated.length > 0) {
              setSelectedImageId(updated[0].id);
            }
            return updated;
          });
        }
      };

      loadFilesAsync();
    }
  };

  const handleRemoveImage = (id: string): void => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((img) => img.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const handleClearAll = (): void => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setSelectedImageId(null);
    setError(null);
  };

  const handlePropertyChange = (field: "width" | "height" | "xPos" | "yPos", value: number) => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === selectedImageId) {
          return { ...img, [field]: value };
        }
        return img;
      })
    );
  };

  const handleAddTextAnnotation = () => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === selectedImageId) {
          const newText: TextAnnotation = {
            id: Math.random().toString(36).substring(2, 9),
            text: "New Text Note",
            x: 35,
            y: 50,
            fontSize: 12,
            fontFamily: "helvetica",
            isBold: false,
            isItalic: false,
            color: "#000000",
          };
          return { ...img, texts: [...img.texts, newText] };
        }
        return img;
      })
    );
  };

  const handleUpdateTextAnnotation = (textId: string, updatedFields: Partial<TextAnnotation>) => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === selectedImageId) {
          const updatedTexts = img.texts.map((t) => (t.id === textId ? { ...t, ...updatedFields } : t));
          return { ...img, texts: updatedTexts };
        }
        return img;
      })
    );
  };

  const handleDeleteTextAnnotation = (textId: string) => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === selectedImageId) {
          return { ...img, texts: img.texts.filter((t) => t.id !== textId) };
        }
        return img;
      })
    );
  };

  const handleConvertToPdf = async (): Promise<void> => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const item = images[i];
        const imgData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(item.file);
        });

        let format = "JPEG";
        if (item.file.type === "image/png") format = "PNG";
        else if (item.file.type === "image/webp") format = "WEBP";

        // Draw Image onto PDF page
        pdf.addImage(imgData, format, item.xPos, item.yPos, item.width, item.height);

        // Draw Text annotations onto PDF page
        for (const t of item.texts) {
          pdf.setFont(t.fontFamily);
          
          let fontStyle = "normal";
          if (t.isBold && t.isItalic) fontStyle = "bolditalic";
          else if (t.isBold) fontStyle = "bold";
          else if (t.isItalic) fontStyle = "italic";
          
          pdf.setFont(t.fontFamily, fontStyle);
          pdf.setFontSize(t.fontSize);
          pdf.setTextColor(t.color);
          pdf.text(t.text, t.x, t.y);
        }
      }

      const fileName = conversionType === "single" ? "single-image.pdf" : `multi-image-${images.length}-pages.pdf`;
      pdf.save(fileName);
    } catch (err: any) {
      setError(err.message || "Failed to convert images to PDF.");
    } finally {
      setLoading(false);
    }
  };

  const selectedImg = images.find((img) => img.id === selectedImageId);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col items-center justify-center p-6 antialiased selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl w-full space-y-8 bg-[#121824] border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Professional PDF Toolkit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Image & Text PDF Editor</h1>
          <p className="text-sm text-slate-400">
            Customize layout size, position, and add styled text labels or captions to your PDF pages.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-[#182030] p-1.5 rounded-2xl border border-slate-700/60">
          <button
            onClick={() => {
              setConversionType("single");
              if (images.length > 1) {
                setImages(images.slice(0, 1));
                setSelectedImageId(images[0]?.id || null);
              }
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer ${
              conversionType === "single"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Single Image Mode</span>
          </button>
          <button
            onClick={() => setConversionType("multi")}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer ${
              conversionType === "multi"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Multi-Image Mode</span>
          </button>
        </div>

        {images.length === 0 && (
          <label className="group relative border-2 border-dashed border-slate-700/70 hover:border-blue-500/80 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-[#182030]/50 hover:bg-[#182030] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-200 text-base mb-1">
              {conversionType === "single" ? "Click to upload an image" : "Click to upload multiple images"}
            </span>
            <span className="text-xs text-slate-400">Supports PNG, JPG, WebP, GIF, BMP</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={conversionType === "multi"}
              onChange={(e) => handleFilesChange(e, false)}
              className="hidden"
            />
          </label>
        )}

        {images.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Uploaded Files ({images.length})
              </span>
              <div className="flex items-center space-x-3">
                {conversionType === "multi" && (
                  <>
                    <button
                      onClick={() => addMoreInputRef.current?.click()}
                      className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add More</span>
                    </button>
                    <input
                      ref={addMoreInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFilesChange(e, true)}
                      className="hidden"
                    />
                  </>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedImageId(item.id)}
                  className={`flex items-center space-x-2 p-2 rounded-xl border shrink-0 transition cursor-pointer ${
                    selectedImageId === item.id
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-[#182030] border-slate-700/60 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <img src={item.previewUrl} alt="" className="w-8 h-8 object-cover rounded-md" />
                  <span className="text-xs font-medium max-w-[100px] truncate">Page {idx + 1}</span>
                </button>
              ))}
            </div>

            {selectedImg && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#182030] border border-slate-700/60 rounded-2xl p-6">
                
                {/* Visual Preview Box */}
                <div className="flex flex-col items-center justify-center bg-black/40 border border-slate-800 rounded-xl p-4 relative min-h-[300px]">
                  <span className="absolute top-3 left-3 text-[11px] text-slate-400 uppercase font-mono tracking-wider">A4 Page Preview</span>
                  <div className="w-[150px] h-[212px] bg-white rounded shadow-md relative overflow-hidden border border-slate-300">
                    <img
                      src={selectedImg.previewUrl}
                      alt="Transform preview"
                      style={{
                        position: "absolute",
                        left: `${(selectedImg.xPos / 210) * 100}%`,
                        top: `${(selectedImg.yPos / 297) * 100}%`,
                        width: `${(selectedImg.width / 210) * 100}%`,
                        height: `${(selectedImg.height / 297) * 100}%`,
                        objectFit: "fill",
                      }}
                    />
                    {selectedImg.texts.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          position: "absolute",
                          left: `${(t.x / 210) * 100}%`,
                          top: `${(t.y / 297) * 100}%`,
                          fontSize: `${Math.max(8, t.fontSize * 0.6)}px`,
                          fontFamily: t.fontFamily,
                          fontWeight: t.isBold ? "bold" : "normal",
                          fontStyle: t.isItalic ? "italic" : "normal",
                          color: t.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor Settings Panel */}
                <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-slate-200 text-sm font-semibold border-b border-slate-700 pb-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      <span>Image Size & Position (mm)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold uppercase">Width</label>
                        <input
                          type="number"
                          value={selectedImg.width}
                          onChange={(e) => handlePropertyChange("width", parseFloat(e.target.value) || 10)}
                          className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold uppercase">Height</label>
                        <input
                          type="number"
                          value={selectedImg.height}
                          onChange={(e) => handlePropertyChange("height", parseFloat(e.target.value) || 10)}
                          className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold uppercase">X Offset</label>
                        <input
                          type="number"
                          value={selectedImg.xPos}
                          onChange={(e) => handlePropertyChange("xPos", parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold uppercase">Y Offset</label>
                        <input
                          type="number"
                          value={selectedImg.yPos}
                          onChange={(e) => handlePropertyChange("yPos", parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Annotations Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <div className="flex items-center space-x-2 text-slate-200 text-sm font-semibold">
                        <Type className="w-4 h-4 text-blue-400" />
                        <span>Text Annotations</span>
                      </div>
                      <button
                        onClick={handleAddTextAnnotation}
                        className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-500/20 transition cursor-pointer"
                      >
                        + Add Text
                      </button>
                    </div>

                    {selectedImg.texts.map((t, index) => (
                      <div key={t.id} className="bg-[#121824] border border-slate-700/80 rounded-xl p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Text Item #{index + 1}</span>
                          <button
                            onClick={() => handleDeleteTextAnnotation(t.id)}
                            className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={t.text}
                          onChange={(e) => handleUpdateTextAnnotation(t.id, { text: e.target.value })}
                          placeholder="Enter caption text..."
                          className="w-full bg-[#182030] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase">Font</label>
                            <select
                              value={t.fontFamily}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { fontFamily: e.target.value })}
                              className="w-full bg-[#182030] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 mt-0.5 focus:outline-none"
                            >
                              <option value="helvetica">Helvetica</option>
                              <option value="times">Times New Roman</option>
                              <option value="courier">Courier</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase">Size (pt)</label>
                            <input
                              type="number"
                              value={t.fontSize}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { fontSize: parseFloat(e.target.value) || 10 })}
                              className="w-full bg-[#182030] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 mt-0.5 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase">X Coord (mm)</label>
                            <input
                              type="number"
                              value={t.x}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { x: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[#182030] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 mt-0.5 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase">Y Coord (mm)</label>
                            <input
                              type="number"
                              value={t.y}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { y: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[#182030] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 mt-0.5 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={t.isBold}
                                onChange={(e) => handleUpdateTextAnnotation(t.id, { isBold: e.target.checked })}
                                className="rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-0"
                              />
                              <span>Bold</span>
                            </label>
                            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={t.isItalic}
                                onChange={(e) => handleUpdateTextAnnotation(t.id, { isItalic: e.target.checked })}
                                className="rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-0"
                              />
                              <span>Italic</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <label className="text-[10px] text-slate-400">Color</label>
                            <input
                              type="color"
                              value={t.color}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { color: e.target.value })}
                              className="w-6 h-6 rounded bg-transparent cursor-pointer border border-slate-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleRemoveImage(selectedImg.id)}
                    className="w-full mt-3 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Selected Page Item</span>
                  </button>

                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <button
            onClick={handleConvertToPdf}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>{loading ? "Generating PDF..." : conversionType === "single" ? "Convert Image & Text to PDF" : `Convert ${images.length} Pages to PDF`}</span>
          </button>
        )}

        <div className="pt-2 flex items-center justify-center space-x-1.5 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secure client-side processing • No external file storage</span>
        </div>

      </div>
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}