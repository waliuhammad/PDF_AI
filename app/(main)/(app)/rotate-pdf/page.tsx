"use client";

<<<<<<< HEAD
import { useState, useRef } from "react";
import { Upload, FileText, X, RotateCw, RotateCcw, Download } from "lucide-react";

export default function RotatePdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") return;
        setFile({ name: f.name, size: formatSize(f.size) });
        setDone(false);
        setRotation(0);
    };

    const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
    const rotateRight = () => setRotation((r) => (r + 90) % 360);

    const handleApply = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <RotateCw className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Rotate PDF</h1>
                <p className="text-muted text-sm mt-1">Rotate every page of your PDF to the orientation you need.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-fg text-sm truncate">{file.name}</p>
                            <p className="text-muted text-xs">{file.size}</p>
                        </div>
                        <button onClick={() => { setFile(null); setDone(false); }} className="text-muted hover:text-[var(--primary)] shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Rotation preview */}
                    <div className="mt-6 rounded-2xl border border-card bg-card p-10 flex items-center justify-center h-56">
                        <div
                            className="w-28 h-36 rounded-md border-2 border-[var(--primary)] bg-red-50 flex items-center justify-center transition-transform duration-300"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            <FileText className="text-[var(--primary)]" size={28} />
                        </div>
                    </div>

                    {/* Rotate controls */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                            onClick={rotateLeft}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-card text-fg text-sm hover:border-[var(--primary)] transition-colors"
                        >
                            <RotateCcw size={16} />
                            Rotate Left
                        </button>
                        <button
                            onClick={rotateRight}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-card text-fg text-sm hover:border-[var(--primary)] transition-colors"
                        >
                            <RotateCw size={16} />
                            Rotate Right
                        </button>
                    </div>
                    <p className="text-center text-muted text-xs mt-2">Current rotation: {rotation}°</p>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleApply}
                                disabled={processing || rotation === 0}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Rotating..." : "Apply Rotation"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Rotated PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
=======
import React, { useState, useEffect, useRef, JSX } from "react";
import { FileText, Trash2, RotateCw, Download, UploadCloud, Layers, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export default function RotatePdfPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(90);
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [pageNumber, setPageNumber] = useState<string>("");
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
        // Use unpkg with .min.mjs matching the installed version safely
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
        setRotation(90);
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
    setRotation(90);
    setMode("all");
    setPageNumber("");
    setError(null);
  };

  const handleRotatePreview = (): void => {
    setRotation((prev) => {
      if (prev === 90) return 180;
      if (prev === 180) return 270;
      if (prev === 270) return 360;
      return 90;
    });
  };

  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    let isMounted = true;

    const renderPages = async (): Promise<void> => {
      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdfDoc.getPage(i);
          const canvas = canvasRefs.current[i];
          if (!canvas || !isMounted) continue;

          const context = canvas.getContext("2d");
          if (!context) continue;

          const viewport = page.getViewport({ scale: 1.0 });
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

    renderPages();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, numPages]);

  const handleRotateAndDownload = async (): Promise<void> => {
    if (!file) return;

    if (mode === "custom" && !pageNumber.trim()) {
      setError("Please specify the exact page number you want to rotate.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rotation", rotation.toString());
      formData.append("mode", mode);
      formData.append("pageNumber", pageNumber);

      const res = await fetch("/api/rotate-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Rotation failed.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}_rotated.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during rotation.");
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Rotate PDF Pages</h1>
          <p className="text-sm text-slate-400">
            Rotate your entire document or target a single specific page cleanly.
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
                onClick={() => setMode("all")}
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
                onClick={() => setMode("custom")}
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
                <p className="text-[11px] text-slate-500">Enter the exact page number you wish to rotate.</p>
              </div>
            )}

            {numPages > 0 && (
              <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">All Pages Preview ({numPages} Total)</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Selected Rotation: {rotation}°
                  </span>
                </div>
                
                <div className="w-full max-h-[420px] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                    const isTargetRotated = mode === "all" || (mode === "custom" && pageNumber === String(pageNum));
                    const currentDegrees = isTargetRotated ? rotation : 0;

                    return (
                      <div key={pageNum} className="bg-black/40 border border-slate-800 rounded-xl p-3 flex flex-col items-center relative shadow-inner">
                        <div className="w-full flex justify-between items-center mb-2 text-[11px] text-slate-400 px-1">
                          <span className="font-semibold text-slate-300">Page {pageNum} of {numPages}</span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-400 font-mono">
                            {currentDegrees}°
                          </span>
                        </div>
                        <div className="w-full h-80 flex items-center justify-center overflow-hidden bg-black/60 rounded-lg p-2">
                          <canvas
                            ref={(el) => { canvasRefs.current[pageNum] = el; }}
                            className="max-h-full max-w-full object-contain origin-center shadow-md"
                            style={{ 
                              transform: `rotate(${currentDegrees}deg)`, 
                              transition: 'transform 0.3s ease-in-out' 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 text-center">Scroll up and down to inspect every page of your document.</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleRotatePreview}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-[#182030] hover:bg-slate-800 border border-slate-700/60 rounded-xl text-sm font-medium text-slate-200 transition shadow-sm cursor-pointer"
              >
                <RotateCw className="w-4 h-4 text-blue-400" />
                <span>Rotate ({rotation}°) • Next Step</span>
              </button>
              <button
                onClick={() => setRotation(90)}
                className="py-3 px-4 bg-[#182030] hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {file && !libLoading && (
          <button
            onClick={handleRotateAndDownload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>{loading ? "Processing Document..." : "Save & Download PDF"}</span>
          </button>
        )}

        <div className="pt-2 flex items-center justify-center space-x-1.5 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secure processing • Files processed privately</span>
        </div>

      </div>
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}