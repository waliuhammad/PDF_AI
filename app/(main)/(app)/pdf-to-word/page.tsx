"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import type * as PdfjsLib from "pdfjs-dist";
import { loadPdfjs } from "@/lib/pdf-libs";

export default function PdfToWordPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  // Preview State
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<PdfjsLib.PDFDocumentProxy | null>(null);
  const [renderedPages, setRenderedPages] = useState<{ [pageNumber: number]: string } | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileAdded = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    if (file.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF file.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(false);
    setRenderedPages(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
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

  // Render pages at a much smaller base scale (0.15) with high upscale factor to maintain sharp, crystal clear text at compact size
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
          const upscaleFactor = 4.0; // High supersampling factor for maximum pixel sharpness at small physical display sizes
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
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(false);
    setPdfDoc(null);
    setNumPages(0);
    setRenderedPages(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeConversion = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/pdf-to-word", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || "Failed to convert PDF to Word.");
        setProcessing(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const originalNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      a.download = `${originalNameWithoutExt}_converted.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(true);
    } catch (err) {
      setErrorMessage("An unexpected error occurred during conversion.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900/10 dark:bg-cyan-500/10 flex items-center justify-center mb-3 border border-purple-900/20 dark:border-cyan-500/20">
          <FileSpreadsheet className="text-purple-900 dark:text-cyan-400" size={28} />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Convert PDF to Word (DOCX)</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-lg mx-auto">
          Transform your static PDF document layout into a fully editable Microsoft Word document instantly.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFileAdded(e.target.files)}
      />

      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileAdded(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-3xl border-2 border-dashed p-16 text-center transition-all ${
            isDragging 
              ? "border-purple-900 bg-purple-100/50 dark:border-cyan-500 dark:bg-cyan-500/10 scale-[1.01]" 
              : "border-slate-300 bg-white dark:border-slate-800 dark:bg-[#121622] hover:border-purple-900 dark:hover:border-cyan-500 shadow-xl"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-cyan-500/10 mx-auto flex items-center justify-center mb-4 text-purple-900 dark:text-cyan-400 shadow-sm border border-purple-200 dark:border-cyan-500/20">
            <Upload size={32} />
          </div>
          <p className="text-slate-900 dark:text-white font-semibold text-lg">Click to browse or drag & drop a PDF</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Supports standard text, multi-column blocks, and embedded structures</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-purple-900/10 dark:bg-cyan-500/10 flex items-center justify-center shrink-0 text-purple-900 dark:text-cyan-400 border border-purple-900/20 dark:border-cyan-500/20">
                <FileText size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 dark:text-white text-sm font-bold truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Size: <strong className="text-slate-900 dark:text-slate-200">{formatSize(selectedFile.size)}</strong> • {numPages} {numPages === 1 ? 'Page' : 'Pages'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              title="Remove File"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Viewer Container with further reduced display size and sharp high-DPI text rendering */}
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[360px] shadow-sm overflow-hidden">
            {isRendering && !renderedPages && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-purple-900 dark:text-cyan-400" size={32} />
              </div>
            )}
            <div className="max-h-[320px] max-w-[260px] w-full overflow-y-auto flex flex-col items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {renderedPages && Object.keys(renderedPages).length > 0 ? (
                Object.entries(renderedPages).map(([pageNum, dataUrl]) => (
                  <div key={pageNum} className="flex flex-col items-center w-full">
                    <img
                      src={dataUrl}
                      alt={`Page ${pageNum}`}
                      style={{ width: `${(0.15 / (0.15 * 4.0)) * 100 * 4.0}%`, maxWidth: '100%' }}
                      className="rounded shadow-md border border-slate-200 dark:border-slate-800 h-auto bg-white"
                    />
                  </div>
                ))
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-purple-900 dark:text-cyan-400" size={28} />
                </div>
              )}
            </div>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} /> Conversion complete! Your Word document has been downloaded.
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold text-center">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={clearFile}
              className="py-4 px-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition-colors"
            >
              Select Different File
            </button>
            <button
              type="button"
              onClick={executeConversion}
              disabled={processing}
              className="flex-1 py-4 rounded-2xl bg-slate-900 dark:bg-[#0d1322] border border-slate-900 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-[#111827] text-white font-bold text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all"
            >
              {processing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {processing ? "Converting to Word..." : "Convert to Word (.docx)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}