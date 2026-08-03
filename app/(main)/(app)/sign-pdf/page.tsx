"use client";

<<<<<<< HEAD
import { useState, useRef } from "react";
import { Upload, FileText, X, Download, FileSignature } from "lucide-react";

export default function SignPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<"type" | "draw">("type");
    const [signatureText, setSignatureText] = useState("");
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
    };

    const handleSign = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <FileSignature className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Sign PDF</h1>
                <p className="text-muted text-sm mt-1">Add your signature to a PDF document.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card "
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card  border border-card">
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

                    {/* Page preview with signature placed bottom-right */}
                    <div className="mt-6 relative rounded-2xl border border-card bg-card  p-6 h-64 overflow-hidden">
                        <div className="space-y-2">
                            <div className="h-2.5 w-4/5 rounded bg-[var(--background-secondary)]" />
                            <div className="h-2.5 w-full rounded bg-[var(--background-secondary)]" />
                            <div className="h-2.5 w-3/5 rounded bg-[var(--background-secondary)]" />
                        </div>
                        <div className="absolute bottom-5 right-6 flex flex-col items-end">
                            <span
                                className="text-2xl text-[var(--primary)] select-none"
                                style={{ fontFamily: "cursive" }}
                            >
                                {signatureText || "Your Signature"}
                            </span>
                            <span className="w-40 border-t border-card mt-1" />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="mt-6 p-5 rounded-2xl bg-card  border border-card space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode("type")}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "type" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-muted"
                                    }`}
                            >
                                Type
                            </button>
                            <button
                                onClick={() => setMode("draw")}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "draw" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-muted"
                                    }`}
                            >
                                Draw
                            </button>
                        </div>

                        {mode === "type" ? (
                            <div>
                                <label className="text-xs text-muted block mb-1">Your name</label>
                                <input
                                    type="text"
                                    value={signatureText}
                                    onChange={(e) => setSignatureText(e.target.value)}
                                    placeholder="e.g. Wali Muhammad"
                                    className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>
                        ) : (
                            <div className="h-28 rounded-lg border-2 border-dashed border-card flex items-center justify-center text-muted text-xs">
                                Draw your signature here
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleSign}
                                disabled={processing || (mode === "type" && !signatureText)}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Signing..." : "Sign PDF"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Signed PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
=======
import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export default function SignDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const [signMode, setSignMode] = useState<"text" | "draw">("text");
  const [signatureText, setSignatureText] = useState("");
  const [position, setPosition] = useState<"left" | "center" | "right">("right");
  const [signScope, setSignScope] = useState<"specific" | "all">("specific");

  const [penColor, setPenColor] = useState("#0f172a");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) return;
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading PDF preview:", err);
      }
    };
    loadPdf();
  }, [file]);

  // Safe PDF.js rendering with active task cancellation to avoid canvas collision errors
  useEffect(() => {
    if (!pdfDocProxy) return;
    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
        }

        const page = await pdfDocProxy.getPage(currentPage);
        const viewport = page.getViewport({ scale: 0.65 });
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderTask = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        // Draw live preview signature overlay
        const hasSignature = signMode === "text" ? signatureText.trim().length > 0 : canvasRef.current !== null;
        if (hasSignature) {
          context.save();
          const margin = 35;
          const sigY = canvas.height - 35;

          if (signMode === "text" && signatureText.trim()) {
            context.font = "bold 14px Helvetica, Arial, sans-serif";
            context.fillStyle = "#0f172a";
            const metrics = context.measureText(signatureText);
            const textWidth = metrics.width;

            let sigX = margin;
            if (position === "center") {
              sigX = (canvas.width - textWidth) / 2;
            } else if (position === "right") {
              sigX = canvas.width - textWidth - margin;
            }

            context.fillText(signatureText, sigX, sigY);
          } else if (signMode === "draw" && canvasRef.current) {
            const drawCanvas = canvasRef.current;
            const imgWidth = 110;
            const imgHeight = 35;

            let sigX = margin;
            if (position === "center") {
              sigX = (canvas.width - imgWidth) / 2;
            } else if (position === "right") {
              sigX = canvas.width - imgWidth - margin;
            }

            context.drawImage(drawCanvas, sigX, sigY - 30, imgWidth, imgHeight);
          }
          context.restore();
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Preview render error:", err);
        }
      }
    };
    renderPage();
  }, [pdfDocProxy, currentPage, signatureText, signMode, position]);

  useEffect(() => {
    if (signMode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 340;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [signMode, penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.strokeStyle = penColor;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (signMode === "text" && !signatureText.trim()) {
      setError("Please enter your signature text.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signMode", signMode);
      formData.append("pageNumber", currentPage.toString());
      formData.append("position", position);
      formData.append("signScope", signScope);

      if (signMode === "text") {
        formData.append("signatureText", signatureText);
      } else if (canvasRef.current) {
        formData.append("signatureImage", canvasRef.current.toDataURL("image/png"));
      }

      const response = await fetch("/api/sign-pdf", { method: "POST", body: formData });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to sign document.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}-signed.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50">
            Document Security Suite
          </span>
          <h1 className="text-3xl font-bold mt-4 tracking-tight text-white">PDF Document Signer</h1>
          <p className="text-slate-400 text-sm mt-1">Preview pages, choose scope, and position your signature.</p>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 transition-colors rounded-xl p-4 text-center bg-[#0d1322]">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
                setError("");
              }
            }}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
            <span className="text-sm font-medium text-slate-300">
              {file ? file.name : "Click to select or drop your PDF document here"}
            </span>
          </label>
        </div>

        {/* PDF Preview & Pagination Controls */}
        {file && numPages > 0 && (
          <div className="space-y-3 bg-[#0d1322] p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Page Preview (Page {currentPage} of {numPages})</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-white"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-white"
                >
                  Next →
                </button>
              </div>
            </div>
            <div className="flex justify-center bg-black/40 rounded-lg p-2 overflow-hidden border border-slate-800">
              <canvas ref={previewCanvasRef} className="rounded shadow max-h-64 object-contain" />
            </div>
          </div>
        )}

        <form onSubmit={handleSign} className="space-y-5">
          {/* Mode Switcher */}
          <div className="flex bg-[#0d1322] p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setSignMode("text")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                signMode === "text" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Text Signature
            </button>
            <button
              type="button"
              onClick={() => setSignMode("draw")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                signMode === "draw" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Draw Signature
            </button>
          </div>

          {signMode === "text" ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Signature Text
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#0d1322] border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Draw Signature
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    {["#0f172a", "#2563eb", "#dc2626", "#059669"].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setPenColor(col)}
                        className={`w-4 h-4 rounded-full border ${penColor === col ? "border-white scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <button type="button" onClick={clearCanvas} className="text-xs text-slate-400 hover:text-cyan-400 underline">
                    Clear
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl overflow-hidden border border-slate-700 flex justify-center p-2">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair touch-none bg-white rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Signing Scope Selector (Specific Page vs All Pages) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Signing Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSignScope("specific")}
                className={`py-2.5 text-xs font-semibold rounded-xl border uppercase tracking-wider transition-all ${
                  signScope === "specific"
                    ? "bg-cyan-600/30 border-cyan-500 text-cyan-300"
                    : "bg-[#0d1322] border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                Specific Page ({currentPage})
              </button>
              <button
                type="button"
                onClick={() => setSignScope("all")}
                className={`py-2.5 text-xs font-semibold rounded-xl border uppercase tracking-wider transition-all ${
                  signScope === "all"
                    ? "bg-cyan-600/30 border-cyan-500 text-cyan-300"
                    : "bg-[#0d1322] border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                All Pages ({numPages})
              </button>
            </div>
          </div>

          {/* Position Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Signature Alignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["left", "center", "right"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`py-2 text-xs font-semibold rounded-xl border uppercase tracking-wider transition-all ${
                    position === pos
                      ? "bg-cyan-600/30 border-cyan-500 text-cyan-300"
                      : "bg-[#0d1322] border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800/80 text-red-300 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 text-sm"
          >
            {loading ? "Applying Signature..." : "Sign and Download PDF"}
          </button>
        </form>
      </div>
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}