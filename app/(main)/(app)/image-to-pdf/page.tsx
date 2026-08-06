"use client";

import React, { useState, useRef, JSX } from "react";
import { Trash2, UploadCloud, Sparkles, Loader2, Image as ImageIcon, Layers, Plus, Sliders, Type } from "lucide-react";
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
  page: number;
  texts: TextAnnotation[];
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 15;
const IMAGE_X = 35;
const IMAGE_W = 140;
const LABEL_OFFSET = 6;
const IMAGE_GAP = 10;

const newId = () => Math.random().toString(36).substring(2, 9);

/** Fit an image to the column width, shrinking it if it is too tall for one page. */
const fitToPage = (naturalW: number, naturalH: number): { width: number; height: number } => {
  let width = IMAGE_W;
  let height = (naturalH / naturalW) * width;
  const maxHeight = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM;

  if (height > maxHeight) {
    width = width * (maxHeight / height);
    height = maxHeight;
  }

  return { width: Number(width.toFixed(1)), height: Number(height.toFixed(1)) };
};

/** Stack the next image below the previous one, moving to a new page when it no longer fits. */
const placeAfter = (placed: ImageFile[], height: number): { page: number; yPos: number } => {
  const last = placed[placed.length - 1];
  if (!last) return { page: 0, yPos: MARGIN_TOP };

  const yPos = last.yPos + last.height + IMAGE_GAP + LABEL_OFFSET;
  if (yPos + height > PAGE_H - MARGIN_BOTTOM) {
    return { page: last.page + 1, yPos: MARGIN_TOP };
  }

  return { page: last.page, yPos: Number(yPos.toFixed(1)) };
};

/**
 * jsPDF reads the real bytes and only falls back to the format argument when it
 * cannot recognise them — so an unrecognised file silently lands in the PDF as a
 * broken JPEG. Name the format ourselves and rasterise anything jsPDF cannot decode.
 */
const sniffFormat = (dataUrl: string): string | null => {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const head = atob(base64.slice(0, 32));
  const byte = (i: number) => head.charCodeAt(i);

  if (byte(0) === 0xff && byte(1) === 0xd8 && byte(2) === 0xff) return "JPEG";
  if (byte(0) === 0x89 && head.slice(1, 4) === "PNG") return "PNG";
  if (head.slice(0, 6) === "GIF89a") return "GIF89A";
  if (head.slice(0, 6) === "GIF87a") return "GIF87A";
  if (head.slice(0, 2) === "BM") return "BMP";
  if (head.slice(0, 4) === "RIFF" && head.slice(8, 12) === "WEBP") return "WEBP";

  return null;
};

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Could not read "${file.name}".`));
    reader.readAsDataURL(file);
  });

/** Redraw through a canvas so formats jsPDF has no decoder for (SVG, AVIF, HEIC) still work. */
const rasteriseToPng = (previewUrl: string, name: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 1000;
      canvas.height = img.naturalHeight || img.height || 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error(`Could not render "${name}".`));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`Could not render "${name}".`));
    img.src = previewUrl;
  });

export default function ImageToPdf(): JSX.Element {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>, isAppending: boolean = false): void => {
    const input = e.target;
    const newFiles = Array.from(input.files ?? []);

    // Clear the input so picking the same file again still fires a change event.
    input.value = "";

    if (newFiles.length === 0) return;
    void loadFiles(newFiles, isAppending);
  };

  const loadFiles = async (newFiles: File[], isAppending: boolean): Promise<void> => {
    const loaded: Array<{ id: string; labelId: string; file: File; previewUrl: string; width: number; height: number }> = [];
    const rejected: string[] = [];

    for (const file of newFiles) {
      if (!file.type.startsWith("image/") && !/\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(file.name)) {
        rejected.push(file.name);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      const dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
        img.onerror = () => resolve(null);
        img.src = previewUrl;
      });

      // A file the browser cannot decode used to be kept at a made-up 500x500 and
      // then broke the PDF instead. Turn it away here, by name.
      if (!dims || !dims.w || !dims.h) {
        URL.revokeObjectURL(previewUrl);
        rejected.push(file.name);
        continue;
      }

      loaded.push({ id: newId(), labelId: newId(), file, previewUrl, ...fitToPage(dims.w, dims.h) });
    }

    setError(
      rejected.length > 0
        ? `Could not read ${rejected.length === 1 ? "this file" : "these files"}: ${rejected.join(", ")}.`
        : null
    );

    if (loaded.length === 0) return;

    if (!isAppending) {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    }

    setImages((prev) => {
      const next = isAppending ? [...prev] : [];

      for (const item of loaded) {
        const { page, yPos } = placeAfter(next, item.height);
        next.push({
          id: item.id,
          file: item.file,
          previewUrl: item.previewUrl,
          width: item.width,
          height: item.height,
          xPos: IMAGE_X,
          yPos,
          page,
          texts: [
            {
              id: item.labelId,
              text: `Image Label ${next.length + 1}`,
              x: IMAGE_X,
              y: Math.max(yPos - LABEL_OFFSET, 5),
              fontSize: 12,
              fontFamily: "helvetica",
              isBold: true,
              isItalic: false,
              color: "#000000",
            },
          ],
        });
      }

      return next;
    });

    if (!isAppending || !selectedImageId) {
      setSelectedImageId(loaded[0].id);
    }
  };

  const handleClearAll = (): void => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setSelectedImageId(null);
    setError(null);
  };

  const handlePropertyChange = (field: "width" | "height" | "xPos" | "yPos" | "page", value: number) => {
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
            x: img.xPos,
            y: img.yPos + img.height + 5,
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

      for (let p = 0; p < usedPages.length; p++) {
        if (p > 0) pdf.addPage();

        for (const item of images.filter((img) => img.page === usedPages[p])) {
          const dataUrl = await readAsDataUrl(item.file);
          const format = sniffFormat(dataUrl);

          if (format) {
            pdf.addImage(dataUrl, format, item.xPos, item.yPos, item.width, item.height);
          } else {
            const png = await rasteriseToPng(item.previewUrl, item.file.name);
            pdf.addImage(png, "PNG", item.xPos, item.yPos, item.width, item.height);
          }

          for (const t of item.texts) {
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
      }

      pdf.save("combined-images-layout.pdf");
    } catch (err: any) {
      setError(err.message || "Failed to convert images to PDF.");
    } finally {
      setLoading(false);
    }
  };

  const selectedImg = images.find((img) => img.id === selectedImageId);
  // Only pages that actually hold something, so moving images around leaves no blanks.
  const usedPages = Array.from(new Set(images.map((img) => img.page))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 antialiased selection:bg-slate-900 dark:selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl w-full space-y-8 bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl shadow-xl dark:shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-blue-500/10 border border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-slate-900 dark:text-blue-400" />
            <span>Multi-Image Page Composition</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Combine Multiple Images into a PDF</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Arrange multiple images and custom text captions on an A4 layout. Images stack down the page and flow onto a new one once it is full.
          </p>
        </div>

        {images.length === 0 && (
          <label className="group relative border-2 border-dashed border-slate-300 dark:border-slate-700/70 hover:border-slate-900 dark:hover:border-blue-500/80 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#182030]/50 hover:bg-slate-100/50 dark:hover:bg-[#182030] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-blue-500/10 flex items-center justify-center text-slate-900 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-200 text-base mb-1">
              Click to upload multiple images
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Supports PNG, JPG, WebP, GIF, BMP</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesChange(e, false)}
              className="hidden"
            />
          </label>
        )}

        {images.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Canvas Elements ({images.length})
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="inline-flex items-center space-x-1 text-xs text-white bg-slate-900 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-transparent dark:border-blue-500/20 transition cursor-pointer font-medium shadow-sm dark:shadow-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Image</span>
                </button>
                <input
                  ref={addMoreInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFilesChange(e, true)}
                  className="hidden"
                />
                <button
                  onClick={handleClearAll}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
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
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm dark:bg-slate-800 dark:border-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-[#182030] dark:border-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <img src={item.previewUrl} alt="" className="w-8 h-8 object-cover rounded-md border border-slate-200 dark:border-none" />
                  <span className="text-xs font-medium max-w-[100px] truncate">Image #{idx + 1}</span>
                </button>
              ))}
            </div>

            {selectedImg && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6">
                
                {/* Visual Preview Box showing ALL images together on one page */}
                <div className="flex flex-col items-center justify-center bg-slate-900/5 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 pt-10 relative min-h-[320px]">
                  <span className="absolute top-3 left-3 text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
                    A4 Preview &mdash; {usedPages.length} {usedPages.length === 1 ? "page" : "pages"}
                  </span>
                  <div className="flex gap-3 overflow-x-auto max-w-full pb-1">
                    {usedPages.map((pageNo, pageIdx) => (
                      <div key={pageNo} className="shrink-0 flex flex-col items-center gap-1.5">
                        <div className="w-[150px] h-[212px] bg-white rounded shadow-lg dark:shadow-md relative overflow-hidden border border-slate-300">
                          {images
                            .filter((img) => img.page === pageNo)
                            .map((img) => (
                              <React.Fragment key={img.id}>
                                <img
                                  src={img.previewUrl}
                                  alt=""
                                  style={{
                                    position: "absolute",
                                    left: `${(img.xPos / PAGE_W) * 100}%`,
                                    top: `${(img.yPos / PAGE_H) * 100}%`,
                                    width: `${(img.width / PAGE_W) * 100}%`,
                                    height: `${(img.height / PAGE_H) * 100}%`,
                                    objectFit: "fill",
                                    outline: img.id === selectedImageId ? "2px solid #0f172a" : "none",
                                  }}
                                />
                                {img.texts.map((t) => (
                                  <div
                                    key={t.id}
                                    style={{
                                      position: "absolute",
                                      left: `${(t.x / PAGE_W) * 100}%`,
                                      top: `${(t.y / PAGE_H) * 100}%`,
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
                              </React.Fragment>
                            ))}
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            selectedImg?.page === pageNo
                              ? "text-slate-900 dark:text-blue-400 font-bold"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          Page {pageIdx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor Settings Panel */}
                <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-200 text-sm font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">
                      <Sliders className="w-4 h-4 text-slate-700 dark:text-slate-400" />
                      <span>Selected Image Dimensions & Coordinates (mm)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Width</label>
                        <input
                          type="number"
                          value={selectedImg.width}
                          onChange={(e) => handlePropertyChange("width", parseFloat(e.target.value) || 10)}
                          className="w-full bg-white dark:bg-[#121824] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Height</label>
                        <input
                          type="number"
                          value={selectedImg.height}
                          onChange={(e) => handlePropertyChange("height", parseFloat(e.target.value) || 10)}
                          className="w-full bg-white dark:bg-[#121824] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">X Offset</label>
                        <input
                          type="number"
                          value={selectedImg.xPos}
                          onChange={(e) => handlePropertyChange("xPos", parseFloat(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-[#121824] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Y Offset</label>
                        <input
                          type="number"
                          value={selectedImg.yPos}
                          onChange={(e) => handlePropertyChange("yPos", parseFloat(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-[#121824] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Page</label>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={selectedImg.page + 1}
                          onChange={(e) =>
                            handlePropertyChange("page", Math.max(0, Math.round(parseFloat(e.target.value) || 1) - 1))
                          }
                          className="w-full bg-white dark:bg-[#121824] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Annotations Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                        <Type className="w-4 h-4 text-slate-700 dark:text-slate-400" />
                        <span>Text Annotations</span>
                      </div>
                      <button
                        onClick={handleAddTextAnnotation}
                        className="text-xs text-white bg-slate-900 dark:text-slate-300 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1 rounded-lg border border-transparent dark:border-slate-700 transition cursor-pointer font-medium shadow-sm dark:shadow-none"
                      >
                        + Add Text
                      </button>
                    </div>

                    {selectedImg.texts.map((t, index) => (
                      <div key={t.id} className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-3 shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Text Item #{index + 1}</span>
                          <button
                            onClick={() => handleDeleteTextAnnotation(t.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={t.text}
                          onChange={(e) => handleUpdateTextAnnotation(t.id, { text: e.target.value })}
                          placeholder="Enter caption text..."
                          className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Font</label>
                            <select
                              value={t.fontFamily}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { fontFamily: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-200 mt-0.5 focus:outline-none"
                            >
                              <option value="helvetica">Helvetica</option>
                              <option value="times">Times New Roman</option>
                              <option value="courier">Courier</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Size (pt)</label>
                            <input
                              type="number"
                              value={t.fontSize}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { fontSize: parseFloat(e.target.value) || 10 })}
                              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-200 mt-0.5 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">X Coord (mm)</label>
                            <input
                              type="number"
                              value={t.x}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { x: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-200 mt-0.5 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Y Coord (mm)</label>
                            <input
                              type="number"
                              value={t.y}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { y: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-200 mt-0.5 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={t.isBold}
                                onChange={(e) => handleUpdateTextAnnotation(t.id, { isBold: e.target.checked })}
                                className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-700 focus:ring-0"
                              />
                              <span>Bold</span>
                            </label>
                            <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={t.isItalic}
                                onChange={(e) => handleUpdateTextAnnotation(t.id, { isItalic: e.target.checked })}
                                className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-700 focus:ring-0"
                              />
                              <span>Italic</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400">Color</label>
                            <input
                              type="color"
                              value={t.color}
                              onChange={(e) => handleUpdateTextAnnotation(t.id, { color: e.target.value })}
                              className="w-6 h-6 rounded bg-transparent cursor-pointer border-0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleConvertToPdf}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xl transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-slate-300" />
                    <span>
                      Download PDF ({images.length} {images.length === 1 ? "image" : "images"}, {usedPages.length}{" "}
                      {usedPages.length === 1 ? "page" : "pages"})
                    </span>
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