"use client";

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
    <div className="min-h-screen bg-background text-fg flex flex-col items-center justify-center p-6 antialiased selection:bg-blue-500 selection:text-fg">
      <div className="max-w-2xl w-full space-y-8 bg-card border border-card p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Professional PDF Toolkit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-fg">Rotate PDF Pages</h1>
          <p className="text-sm text-muted">
            Rotate your entire document or target a single specific page cleanly.
          </p>
        </div>

        {libLoading ? (
          <div className="border-2 border-dashed border-card rounded-2xl p-12 flex flex-col items-center justify-center bg-[var(--background-secondary)] space-y-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-sm text-fg font-medium">Initializing PDF Engine...</span>
          </div>
        ) : !file ? (
          <label className="group relative border-2 border-dashed border-card hover:border-blue-500/80 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-[var(--background-secondary)] hover:bg-[var(--background-secondary)] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-fg text-base mb-1">Click to upload or drag & drop</span>
            <span className="text-xs text-muted">PDF documents up to 50MB</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="bg-[var(--background-secondary)] border border-card rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left truncate">
                  <p className="font-medium text-sm text-fg truncate">{file.name}</p>
                  <p className="text-xs text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB • {numPages} Pages Detected</p>
                </div>
              </div>
              <button
                onClick={handleClearFile}
                className="p-2 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[var(--background-secondary)] p-1.5 rounded-2xl border border-card">
              <button
                onClick={() => setMode("all")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer ${
                  mode === "all"
                    ? "bg-blue-600 text-fg shadow-lg shadow-blue-600/30"
                    : "text-muted hover:text-fg hover:bg-[var(--background-secondary)]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Whole Document</span>
              </button>
              <button
                onClick={() => setMode("custom")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer ${
                  mode === "custom"
                    ? "bg-blue-600 text-fg shadow-lg shadow-blue-600/30"
                    : "text-muted hover:text-fg hover:bg-[var(--background-secondary)]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Specific Page</span>
              </button>
            </div>

            {mode === "custom" && (
              <div className="bg-[var(--background-secondary)] border border-card rounded-2xl p-4 text-left space-y-2">
                <label className="text-xs text-muted font-bold uppercase tracking-wider">
                  Target Page Number (1 - {numPages || 1})
                </label>
                <input
                  type="number"
                  min="1"
                  max={numPages || 1}
                  placeholder="e.g. 1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-muted">Enter the exact page number you wish to rotate.</p>
              </div>
            )}

            {numPages > 0 && (
              <div className="bg-[var(--background-secondary)] border border-card rounded-2xl p-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">All Pages Preview ({numPages} Total)</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Selected Rotation: {rotation}°
                  </span>
                </div>
                
                <div className="w-full max-h-[420px] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                    const isTargetRotated = mode === "all" || (mode === "custom" && pageNumber === String(pageNum));
                    const currentDegrees = isTargetRotated ? rotation : 0;

                    return (
                      <div key={pageNum} className="bg-black/40 border border-card rounded-xl p-3 flex flex-col items-center relative shadow-inner">
                        <div className="w-full flex justify-between items-center mb-2 text-[11px] text-muted px-1">
                          <span className="font-semibold text-fg">Page {pageNum} of {numPages}</span>
                          <span className="bg-[var(--background-secondary)] px-2 py-0.5 rounded text-blue-400 font-mono">
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
                <p className="text-[11px] text-muted mt-3 text-center">Scroll up and down to inspect every page of your document.</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleRotatePreview}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-[var(--background-secondary)] hover:bg-[var(--background-secondary)] border border-card rounded-xl text-sm font-medium text-fg transition shadow-sm cursor-pointer"
              >
                <RotateCw className="w-4 h-4 text-blue-400" />
                <span>Rotate ({rotation}°) • Next Step</span>
              </button>
              <button
                onClick={() => setRotation(90)}
                className="py-3 px-4 bg-[var(--background-secondary)] hover:bg-[var(--background-secondary)] border border-card rounded-xl text-xs font-medium text-muted hover:text-fg transition cursor-pointer"
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
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-fg font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>{loading ? "Processing Document..." : "Save & Download PDF"}</span>
          </button>
        )}

        <div className="pt-2 flex items-center justify-center space-x-1.5 text-muted text-xs">
          <ShieldCheck className="w-4 h-4 text-muted" />
          <span>Secure processing • Files processed privately</span>
        </div>

      </div>
    </div>
  );
}