"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X, Scissors, Download, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Use standard cdnjs worker path corresponding to pdfjs-dist version
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function SplitPdfPage() {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [splitMode, setSplitMode] = useState<"range" | "every">("range");
  const [fromPage, setFromPage] = useState("1");
  const [toPage, setToPage] = useState("1");
  const [everyN, setEveryN] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadChoice, setDownloadChoice] = useState<"split" | "remaining">("split");
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleModeChange = (mode: "range" | "every") => {
    setSplitMode(mode);
    setDone(false);
    setErrorMessage(null);
  };

  const generateThumbnails = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      setPageCount(numPages);

      const thumbs: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.8 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          thumbs.push(canvas.toDataURL());
        }
      }
      setThumbnails(thumbs);
    } catch (err) {
      console.error("Error generating real page thumbnails:", err);
      setErrorMessage("Could not render actual page previews for this PDF.");
    }
  };

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF file.");
      return;
    }

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      setRawFile(f);
      setFileDetails({ name: f.name, size: formatSize(f.size) });
      setDone(false);
      setErrorMessage(null);
      setDownloadChoice("split");
      setFromPage("1");
      setToPage(String(totalPages > 1 ? totalPages : 1));
      setSelectingFrom(true);

      await generateThumbnails(f);
    } catch (err) {
      console.error("Error reading PDF:", err);
      setErrorMessage("Failed to read the selected PDF file.");
    }
  };

  const handlePageClick = (page: number) => {
    if (splitMode !== "range") return;
    setDone(false);
    setErrorMessage(null);
    if (selectingFrom) {
      setFromPage(String(page));
      setToPage(String(page));
      setSelectingFrom(false);
    } else {
      const from = Number(fromPage);
      if (page >= from) {
        setToPage(String(page));
      } else {
        setToPage(fromPage);
        setFromPage(String(page));
      }
      setSelectingFrom(true);
    }
  };

  const executeSplit = async (choice: "split" | "remaining") => {
    if (!rawFile) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", rawFile);
      formData.append("splitMode", splitMode);
      formData.append("fromPage", fromPage);
      formData.append("toPage", toPage);
      formData.append("everyN", everyN);
      formData.append("downloadChoice", choice);

      const response = await fetch("/api/split-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to split PDF. Check your selected page range.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = choice === "remaining" ? "remaining-pages.pdf" : "split-document.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDone(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while connecting to the server.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto w-full px-4 py-8 ${fileDetails ? "flex flex-col lg:flex-row gap-6 lg:gap-8 items-start" : "max-w-3xl mx-auto"}`}>
      {fileDetails && (
        <aside className="w-full lg:w-80 shrink-0 rounded-2xl bg-card border border-card p-4 lg:sticky lg:top-6">
          <p className="text-sm font-semibold text-fg truncate mb-1">{fileDetails.name}</p>
          <p className="text-xs text-muted mb-4">
            {splitMode === "range" ? "Click pages to select range" : `${pageCount} pages`}
          </p>
          <div className="flex lg:block gap-3 lg:space-y-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[75vh]">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page, idx) => {
              const inRange =
                splitMode === "range" &&
                page >= Number(fromPage) &&
                page <= Number(toPage);
              const isEdge =
                splitMode === "range" &&
                (page === Number(fromPage) || page === Number(toPage));
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`w-36 lg:w-full shrink-0 rounded-xl border p-3 text-left transition-colors ${
                    isEdge
                      ? "border-blue-500 bg-blue-500/10"
                      : inRange
                      ? "border-blue-500/40 bg-blue-500/5"
                      : "border-card bg-card hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isEdge
                          ? "bg-blue-600 text-fg"
                          : "bg-[var(--background-secondary)] text-muted"
                      }`}
                    >
                      Page {page}
                    </span>
                  </div>
                  <div className="bg-white rounded overflow-hidden flex items-center justify-center aspect-[1/1.3] shadow-inner">
                    {thumbnails[idx] ? (
                      <img src={thumbnails[idx]} alt={`Page ${page}`} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center text-slate-400">
                        {/* Fixed colour: this sits on the fixed-white page thumbnail. */}
                        <Loader2 className="animate-spin" size={16} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      <div className={fileDetails ? "w-full lg:flex-1 lg:min-w-0" : "w-full"}>
        <div className="text-center mb-8 lg:mb-10">
          <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Scissors className="text-blue-400" size={24} />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-fg tracking-tight">Split PDF</h1>
          <p className="text-muted text-sm mt-1">Separate one PDF into multiple files or extract pages.</p>
        </div>

        {!fileDetails ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors bg-card border-card hover:border-blue-500/50 ${
              isDragging ? "border-blue-500 bg-blue-500/5" : ""
            }`}
          >
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 text-blue-400">
              <Upload size={22} />
            </div>
            <p className="text-fg font-medium text-sm">Click to browse or drag & drop PDFs</p>
            <p className="text-muted text-xs mt-1">Upload a document to start splitting pages</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-fg text-sm truncate">{fileDetails.name}</p>
                <p className="text-muted text-xs">{fileDetails.size} • {pageCount} pages</p>
              </div>
              <button 
                onClick={() => { setFileDetails(null); setRawFile(null); setDone(false); setErrorMessage(null); setThumbnails([]); }} 
                className="text-muted hover:text-fg shrink-0 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-card space-y-4">
              <p className="text-sm font-medium text-fg">Split Mode</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleModeChange("range")}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    splitMode === "range" ? "bg-blue-600 text-fg shadow-lg shadow-blue-500/20" : "bg-card text-fg border border-card hover:bg-[var(--background-secondary)]"
                  }`}
                >
                  Extract Page Range
                </button>
                <button
                  onClick={() => handleModeChange("every")}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    splitMode === "every" ? "bg-blue-600 text-fg shadow-lg shadow-blue-500/20" : "bg-card text-fg border border-card hover:bg-[var(--background-secondary)]"
                  }`}
                >
                  Split Every N Pages
                </button>
              </div>

              {splitMode === "range" ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-wider font-semibold text-muted block mb-1.5">From Page</label>
                    <input
                      type="number"
                      min="1"
                      max={pageCount}
                      value={fromPage}
                      onChange={(e) => { setFromPage(e.target.value); setSelectingFrom(false); setDone(false); setErrorMessage(null); }}
                      className="w-full bg-card border border-card rounded-xl px-3.5 py-2.5 text-fg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-wider font-semibold text-muted block mb-1.5">To Page</label>
                    <input
                      type="number"
                      min="1"
                      max={pageCount}
                      value={toPage}
                      onChange={(e) => { setToPage(e.target.value); setSelectingFrom(true); setDone(false); setErrorMessage(null); }}
                      className="w-full bg-card border border-card rounded-xl px-3.5 py-2.5 text-fg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-muted block mb-1.5">Pages per File</label>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={everyN}
                    onChange={(e) => { setEveryN(e.target.value); setDone(false); setErrorMessage(null); }}
                    className="w-full bg-card border border-card rounded-xl px-3.5 py-2.5 text-fg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {!done && (
              <div className="text-center pt-2">
                <button
                  onClick={() => executeSplit(downloadChoice)}
                  disabled={processing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-fg font-medium text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Splitting PDF...
                    </>
                  ) : (
                    "Split PDF"
                  )}
                </button>
              </div>
            )}

            {done && (
              <div className="p-5 rounded-2xl bg-card border border-card space-y-4">
                <p className="text-sm font-medium text-fg">Download Options</p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setDownloadChoice("split")}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      downloadChoice === "split" ? "bg-blue-600 text-fg shadow-lg shadow-blue-500/20" : "bg-card text-fg border border-card hover:bg-[var(--background-secondary)]"
                    }`}
                  >
                    Split Part
                  </button>
                  <button
                    onClick={() => setDownloadChoice("remaining")}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      downloadChoice === "remaining" ? "bg-blue-600 text-fg shadow-lg shadow-blue-500/20" : "bg-card text-fg border border-card hover:bg-[var(--background-secondary)]"
                    }`}
                  >
                    Remaining Part
                  </button>
                </div>

                <p className="text-xs text-muted">
                  {downloadChoice === "split"
                    ? splitMode === "range"
                      ? `Pages ${fromPage}–${toPage} that you extracted.`
                      : `The pages split out every ${everyN} page(s).`
                    : "The pages left over after the split."}
                </p>

                <div className="text-center pt-2">
                  <button
                    onClick={() => executeSplit(downloadChoice)}
                    disabled={processing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-fg font-medium text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60"
                  >
                    {processing ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                    Download {downloadChoice === "split" ? "Split" : "Remaining"} PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}