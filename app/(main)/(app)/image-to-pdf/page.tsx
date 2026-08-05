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
  texts: TextAnnotation[];
}

export default function ImageToPdf(): JSX.Element {
  const [images, setImages] = useState<ImageFile[]>([]);
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
            const currentTotal = isAppending ? images.length + i : i;
            
            const defaultY = 20 + (currentTotal % 3) * 65;

            validImages.push({
              id: Math.random().toString(36).substring(2, 9),
              file,
              previewUrl,
              width: Number(defaultW.toFixed(1)),
              height: Number(defaultH.toFixed(1)),
              xPos: 35,
              yPos: Number(defaultY.toFixed(1)),
              texts: [
                {
                  id: Math.random().toString(36).substring(2, 9),
                  text: `Image Label ${currentTotal + 1}`,
                  x: 35,
                  y: defaultY - 6 > 5 ? defaultY - 6 : 5,
                  fontSize: 12,
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

        if (!isAppending) {
          images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
          setImages(validImages);
          setSelectedImageId(validImages[0]?.id || null);
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

      for (let i = 0; i < images.length; i++) {
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

        pdf.addImage(imgData, format, item.xPos, item.yPos, item.width, item.height);

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

      pdf.save("combined-images-layout.pdf");
    } catch (err: any) {
      setError(err.message || "Failed to convert images to PDF.");
    } finally {
      setLoading(false);
    }
  };

  const selectedImg = images.find((img) => img.id === selectedImageId);

  return (
 <div className="text-slate-900 dark:text-slate-100 flex flex-col items-center antialiased selection:bg-slate-900 dark:selection:bg-blue-500 selection:text-white">
      <div className="max-w-5xl w-full space-y-8 bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl shadow-xl dark:shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-blue-500/10 border border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-slate-900 dark:text-blue-400" />
            <span>Multi-Image Single Page Composition</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Combine Multiple Images on One PDF Page</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Arrange multiple images and custom text captions together on a single unified A4 page layout.
          </p>
        </div>

        {images.length === 0 && (
          <label className="group relative border-2 border-dashed border-slate-300 dark:border-slate-700/70 hover:border-slate-900 dark:hover:border-blue-500/80 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#182030]/50 hover:bg-slate-100/50 dark:hover:bg-[#182030] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-blue-500/10 flex items-center justify-center text-slate-900 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-200 text-base mb-1">
              Click to upload multiple images for the same page
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
                <div className="flex flex-col items-center justify-center bg-slate-900/5 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 relative min-h-[320px]">
                  <span className="absolute top-3 left-3 text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Unified A4 Page Preview</span>
                  <div className="w-[150px] h-[212px] bg-white rounded shadow-lg dark:shadow-md relative overflow-hidden border border-slate-300">
                    {images.map((img) => (
                      <React.Fragment key={img.id}>
                        <img
                          src={img.previewUrl}
                          alt=""
                          style={{
                            position: "absolute",
                            left: `${(img.xPos / 210) * 100}%`,
                            top: `${(img.yPos / 297) * 100}%`,
                            width: `${(img.width / 210) * 100}%`,
                            height: `${(img.height / 297) * 100}%`,
                            objectFit: "fill",
                            outline: img.id === selectedImageId ? "2px solid #0f172a" : "none",
                          }}
                        />
                        {img.texts.map((t) => (
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
                      </React.Fragment>
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
                    <span>Download Combined PDF Page ({images.length} Images)</span>
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