"use client";

<<<<<<< HEAD
import { useState, useRef } from "react";
import { Upload, FileText, X, Download, Image as ImageIcon, Check } from "lucide-react";
import { convertPdfToImages, type ImageFormat } from "@/lib/api";

const FORMATS: { id: ImageFormat; label: string; desc: string }[] = [
    { id: "jpg", label: "JPG", desc: "Smaller size, best for photos" },
    { id: "png", label: "PNG", desc: "Lossless, supports transparency" },
    { id: "svg", label: "SVG", desc: "Vector, scales without quality loss" },
    { id: "webp", label: "WEBP", desc: "Modern format, small file size" },
];

export default function PdfToImagePage() {
    const [file, setFile] = useState<{ name: string; size: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [format, setFormat] = useState<ImageFormat>("jpg");
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ imageCount: number; format: ImageFormat } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") return;
        setFile({ name: f.name, size: f.size });
        setResult(null);
    };

    const handleConvert = async () => {
        if (!file) return;
        setProcessing(true);
        const res = await convertPdfToImages({ name: file.name, size: file.size }, format);
        setResult({ imageCount: res.imageCount, format: res.format });
        setProcessing(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-0">
            <div className="text-center mb-8 sm:mb-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <ImageIcon className="text-[var(--primary)]" size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-fg">PDF to Image</h1>
                <p className="text-muted text-sm mt-1 px-2 sm:px-0">Convert each page of your PDF into an image file.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={26} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or tap to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-fg text-sm truncate">{file.name}</p>
                            <p className="text-muted text-xs">{formatSize(file.size)}</p>
                        </div>
                        <button
                            onClick={() => { setFile(null); setResult(null); }}
                            className="text-muted hover:text-[var(--primary)] shrink-0 p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {!result && (
                        <>
                            {/* Output format — radio selection */}
                            <div className="mt-6">
                                <p className="text-xs text-muted mb-3">Convert to</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {FORMATS.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFormat(f.id)}
                                            className={`text-left p-3 sm:p-4 rounded-xl border transition-colors ${format === f.id ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-fg">{f.label}</span>
                                                <span
                                                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${format === f.id ? "border-[var(--primary)] bg-[var(--primary)]" : "border-card"
                                                        }`}
                                                >
                                                    {format === f.id && <Check size={10} className="text-white" />}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted leading-snug">{f.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleConvert}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                                >
                                    {processing ? "Converting..." : `Convert to ${format.toUpperCase()}`}
                                </button>
                            </div>
                        </>
                    )}

                    {result && (
                        <div className="mt-6 text-center">
                            <div className="rounded-xl border border-card bg-card p-4 sm:p-6 mb-6">
                                <p className="text-sm text-fg">
                                    <span className="font-semibold">{result.imageCount}</span> pages converted to{" "}
                                    <span className="font-semibold uppercase">{result.format}</span>
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                    <Download size={18} />
                                    Download Images (ZIP)
                                </button>
                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full border border-card text-fg font-medium hover:bg-bg transition-colors"
                                >
                                    Try Another Format
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
=======
import React, { useState, useEffect, useRef, JSX } from "react";
import { FileText, Trash2, Download, UploadCloud, Layers, ShieldCheck, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";

export default function PdfToImage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [pageNumber, setPageNumber] = useState<string>("");
  const [imageFormat, setImageFormat] = useState<string>("image/png");
  const [loading, setLoading] = useState<boolean>(false);
  const [libLoading, setLibLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<any | null>(null);

  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    let isMounted = true;
    import("pdfjs-dist")
      .then((lib) => {
        if (!isMounted) return;
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
        setPdfjsLib(lib);
        setLibLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load pdfjs:", err);
        if (isMounted) {
          setError("Failed to load PDF engine.");
          setLibLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
        setFile(selectedFile);
        setMode("all");
        setPageNumber("");
        setError(null);

        if (!pdfjsLib) {
          setError("PDF engine is still initializing. Please wait and re-upload.");
          return;
        }

        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          const loadedPdf = await loadingTask.promise;
          
          if (!loadedPdf || loadedPdf.numPages === 0) {
            throw new Error("No pages found in this PDF.");
          }

          setPdfDoc(loadedPdf);
          setNumPages(loadedPdf.numPages);
        } catch (err) {
          console.error("PDF parse error:", err);
          setError("Failed to parse PDF document pages. File might be corrupted or password-protected.");
          setPdfDoc(null);
          setNumPages(0);
        }
      } else {
        setError("Please upload a valid PDF document.");
      }
    }
  };

  const handleClearFile = (): void => {
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setMode("all");
    setPageNumber("");
    setError(null);
  };

  // Renders pages based on mode: all pages when mode is "all", or just the target page when mode is "custom"
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    let isMounted = true;

    const renderSelectedPages = async (): Promise<void> => {
      const pagesToRender: number[] = [];

      if (mode === "all") {
        for (let i = 1; i <= numPages; i++) {
          pagesToRender.push(i);
        }
      } else {
        const target = parseInt(pageNumber, 10);
        if (!isNaN(target) && target >= 1 && target <= numPages) {
          pagesToRender.push(target);
        }
      }

      for (const i of pagesToRender) {
        try {
          const page = await pdfDoc.getPage(i);
          const canvas = canvasRefs.current[i];
          if (!canvas || !isMounted) continue;

          const context = canvas.getContext("2d");
          if (!context) continue;

          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          const renderTask = page.render(renderContext);
          await renderTask.promise;
        } catch (err) {
          console.error(`Error rendering page ${i}:`, err);
        }
      }
    };

    renderSelectedPages();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, numPages, mode, pageNumber]);

  const handleDownloadImages = async (): Promise<void> => {
    if (!file) return;

    if (mode === "custom" && !pageNumber.trim()) {
      setError("Please specify the exact page number you want to convert.");
      return;
    }

    setLoading(true);
    setError(null);

    const extensionMap: { [key: string]: string } = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/bmp": "bmp",
      "image/gif": "gif"
    };
    const ext = extensionMap[imageFormat] || "png";

    try {
      if (mode === "all") {
        for (let i = 1; i <= numPages; i++) {
          const canvas = canvasRefs.current[i];
          if (!canvas) continue;

          const imageURL = canvas.toDataURL(imageFormat, 1.0);
          const a = document.createElement("a");
          a.href = imageURL;
          a.download = `${file.name.replace(/\.[^/.]+$/, "")}_page_${i}.${ext}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } else {
        const targetNum = parseInt(pageNumber, 10);
        if (isNaN(targetNum) || targetNum < 1 || targetNum > numPages) {
          throw new Error(`Invalid page number. Please enter a number between 1 and ${numPages}.`);
        }

        const canvas = canvasRefs.current[targetNum];
        if (!canvas) {
          throw new Error("Target page canvas not found. Make sure the page number is valid.");
        }

        const imageURL = canvas.toDataURL(imageFormat, 1.0);
        const a = document.createElement("a");
        a.href = imageURL;
        a.download = `${file.name.replace(/\.[^/.]+$/, "")}_page_${targetNum}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during image conversion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col items-center justify-center p-6 antialiased selection:bg-blue-500 selection:text-white">
      <div className="max-w-2xl w-full space-y-8 bg-[#121824] border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Professional PDF Toolkit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">PDF to Image Converter</h1>
          <p className="text-sm text-slate-400">
            Convert your whole document or a specific targeted page into high-quality images.
          </p>
        </div>

        {libLoading ? (
          <div className="border-2 border-dashed border-slate-700/70 rounded-2xl p-12 flex flex-col items-center justify-center bg-[#182030]/50 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-sm text-slate-300 font-medium">Initializing PDF Engine...</span>
          </div>
        ) : !file ? (
          <label className="group relative border-2 border-dashed border-slate-700/70 hover:border-blue-500/80 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-[#182030]/50 hover:bg-[#182030] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-200 text-base mb-1">Click to upload or drag & drop</span>
            <span className="text-xs text-slate-400">PDF documents up to 50MB</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left truncate">
                  <p className="font-medium text-sm text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • {numPages} Pages Detected</p>
                </div>
              </div>
              <button
                onClick={handleClearFile}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#182030] p-1.5 rounded-2xl border border-slate-700/60">
              <button
                onClick={() => {
                  setMode("all");
                  setPageNumber("");
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer ${
                  mode === "all"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Whole Document</span>
              </button>
              <button
                onClick={() => {
                  setMode("custom");
                  setPageNumber("1"); // Default to page 1 preview when switching to custom
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer ${
                  mode === "custom"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Specific Page</span>
              </button>
            </div>

            {mode === "custom" && (
              <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-4 text-left space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Target Page Number (1 - {numPages || 1})
                </label>
                <input
                  type="number"
                  min="1"
                  max={numPages || 1}
                  placeholder="e.g. 1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full bg-[#121824] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-slate-500">Enter the exact page number to preview and convert that specific page only.</p>
              </div>
            )}

            <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-4 text-left space-y-2">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Select Output Image Format
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="w-full bg-[#121824] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="image/png">PNG (.png)</option>
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/webp">WebP (.webp)</option>
                <option value="image/bmp">BMP (.bmp)</option>
                <option value="image/gif">GIF (.gif)</option>
              </select>
              <p className="text-[11px] text-slate-500">Choose the file format for your downloaded images.</p>
            </div>

            {numPages > 0 && (
              <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {mode === "all" ? `Previews (${numPages} Total Pages)` : `Target Page Preview (Page ${pageNumber || "?"})`}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                    Format: {imageFormat.split("/")[1]}
                  </span>
                </div>
                
                <div className="w-full max-h-[420px] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                    const isVisible = mode === "all" || (mode === "custom" && pageNumber === String(pageNum));
                    if (!isVisible) return null;

                    return (
                      <div key={pageNum} className="bg-black/40 border border-slate-800 rounded-xl p-3 flex flex-col items-center relative shadow-inner">
                        <div className="w-full flex justify-between items-center mb-2 text-[11px] text-slate-400 px-1">
                          <span className="font-semibold text-slate-300">Page {pageNum} of {numPages}</span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-400 font-mono uppercase">
                            {imageFormat.split("/")[1]}
                          </span>
                        </div>
                        <div className="w-full h-80 flex items-center justify-center overflow-hidden bg-white rounded-lg p-2">
                          <canvas
                            ref={(el) => { canvasRefs.current[pageNum] = el; }}
                            className="max-h-full max-w-full object-contain origin-center shadow-md bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 text-center">
                  {mode === "all" ? "Showing all document pages." : "Showing preview for the specified target page only."}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {file && !libLoading && (
          <button
            onClick={handleDownloadImages}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>{loading ? "Converting Images..." : mode === "all" ? `Download All Images (${imageFormat.split("/")[1].toUpperCase()})` : `Download Page Image (${imageFormat.split("/")[1].toUpperCase()})`}</span>
          </button>
        )}

        <div className="pt-2 flex items-center justify-center space-x-1.5 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secure client-side processing • No server upload needed</span>
        </div>

      </div>
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}