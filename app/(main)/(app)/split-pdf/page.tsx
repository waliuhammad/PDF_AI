"use client";

<<<<<<< HEAD
import { useState, useRef } from "react";
import { Upload, FileText, X, Scissors, Download } from "lucide-react";

// Mock page count and content-line widths until real PDF parsing is wired up on the backend.
const MOCK_PAGE_COUNT = 12;
const MOCK_LINE_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-full", "w-3/5", "w-5/6"];

export default function SplitPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [splitMode, setSplitMode] = useState<"range" | "every">("range");
    const [fromPage, setFromPage] = useState("1");
    const [toPage, setToPage] = useState("1");
    const [everyN, setEveryN] = useState("1");
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const [downloadChoice, setDownloadChoice] = useState<"split" | "remaining">("split");
    // true = next sidebar click sets the "from" page, false = next click sets "to"
    const [selectingFrom, setSelectingFrom] = useState(true);
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
        setDownloadChoice("split");
        setFromPage("1");
        setToPage("1");
        setSelectingFrom(true);
    };

    const handlePageClick = (page: number) => {
        if (splitMode !== "range") return;
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

    const handleSplit = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Left sidebar — vertical list on desktop, horizontal scroll strip on tablet/mobile */}
            {file && (
                <aside className="w-full lg:w-80 shrink-0 rounded-2xl bg-card  border border-card p-4 lg:sticky lg:top-6">
                    <p className="text-sm font-semibold text-fg truncate mb-1">{file.name}</p>
                    <p className="text-xs text-muted mb-4">
                        {splitMode === "range" ? "Tap/click pages to set range" : `${MOCK_PAGE_COUNT} pages`}
                    </p>
                    <div className="flex lg:block gap-3 lg:space-y-3 lg:space-x-0 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[75vh] pb-2 lg:pb-0 pr-0 lg:pr-1">
                        {Array.from({ length: MOCK_PAGE_COUNT }, (_, i) => i + 1).map((page) => {
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
                                    className={`w-36 lg:w-full shrink-0 rounded-xl border p-4 text-left transition-colors ${isEdge
                                        ? "border-[var(--primary)] bg-red-50"
                                        : inRange
                                            ? "border-[var(--primary)]/40 bg-red-50/50"
                                            : "border-card bg-card  hover:border-[var(--primary)]/40"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span
                                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isEdge ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-muted"
                                                }`}
                                        >
                                            Page {page}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {MOCK_LINE_WIDTHS.map((w, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded ${w} ${isEdge || inRange ? "bg-[var(--primary)]/25" : "bg-[var(--background-secondary)]"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>
            )}

            {/* Right side — header + existing controls */}
            <div className={file ? "w-full lg:flex-1 lg:min-w-0 lg:max-w-2xl" : "max-w-3xl mx-auto w-full"}>
                <div className="text-center mb-8 lg:mb-10">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <Scissors className="text-[var(--primary)]" size={24} />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold text-fg">Split PDF</h1>
                    <p className="text-muted text-sm mt-1 px-4 lg:px-0">Separate one PDF into multiple files, or extract specific pages.</p>
                </div>

                {!file ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                        onClick={() => inputRef.current?.click()}
                        className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card "
                            }`}
                    >
                        <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                        <Upload className="mx-auto text-muted mb-3" size={28} />
                        <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                        <p className="text-muted text-xs mt-1">or tap to browse</p>
                    </div>
                ) : (
                    <>
                        {/* Selected file */}
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

                        {/* Split options */}
                        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-card  border border-card">
                            <p className="text-sm font-medium text-fg mb-4">Split method</p>

                            <div className="flex flex-col sm:flex-row gap-2 mb-5">
                                <button
                                    onClick={() => setSplitMode("range")}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${splitMode === "range" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                        }`}
                                >
                                    Extract page range
                                </button>
                                <button
                                    onClick={() => setSplitMode("every")}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${splitMode === "every" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                        }`}
                                >
                                    Split every N pages
                                </button>
                            </div>

                            {splitMode === "range" ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-muted block mb-1">From page</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={fromPage}
                                            onChange={(e) => { setFromPage(e.target.value); setSelectingFrom(false); }}
                                            className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-muted block mb-1">To page</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={toPage}
                                            onChange={(e) => { setToPage(e.target.value); setSelectingFrom(true); }}
                                            className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs text-muted block mb-1">Pages per file</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={everyN}
                                        onChange={(e) => setEveryN(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-card text-fg text-sm bg-card  focus:outline-none focus:border-[var(--primary)]"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            {!done && (
                                <button
                                    onClick={handleSplit}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                                >
                                    {processing ? "Splitting..." : "Split PDF"}
                                </button>
                            )}
                        </div>

                        {/* Preview method — choose which part to download */}
                        {done && (
                            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-card  border border-card">
                                <p className="text-sm font-medium text-fg mb-4">Preview method</p>

                                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                                    <button
                                        onClick={() => setDownloadChoice("split")}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${downloadChoice === "split" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                            }`}
                                    >
                                        Split part
                                    </button>
                                    <button
                                        onClick={() => setDownloadChoice("remaining")}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${downloadChoice === "remaining" ? "bg-[var(--primary)] text-white" : "bg-[var(--background-secondary)] text-fg"
                                            }`}
                                    >
                                        Remaining part
                                    </button>
                                </div>

                                <p className="text-xs text-muted mb-5">
                                    {downloadChoice === "split"
                                        ? splitMode === "range"
                                            ? `Pages ${fromPage}–${toPage} that you extracted.`
                                            : `The pages split out every ${everyN} page(s).`
                                        : "The pages left over after the split."}
                                </p>

                                <div className="text-center">
                                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                        <Download size={18} />
                                        Download {downloadChoice === "split" ? "Split" : "Remaining"} PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
=======
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
        const viewport = page.getViewport({ scale: 0.8 }); // Higher quality preview render
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
      a.download = `${choice}_${rawFile.name}`;
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

  const isAllPagesSelected =
    splitMode === "range" &&
    Number(fromPage) === 1 &&
    Number(toPage) === pageCount;

  return (
    <div className={`max-w-6xl mx-auto w-full px-4 py-8 ${fileDetails ? "flex flex-col lg:flex-row gap-6 lg:gap-8 items-start" : "max-w-3xl mx-auto"}`}>
      {fileDetails && (
        <aside className="w-full lg:w-80 shrink-0 rounded-2xl bg-[#111827] border border-slate-800/80 p-4 lg:sticky lg:top-6">
          <p className="text-sm font-semibold text-white truncate mb-1">{fileDetails.name}</p>
          <p className="text-xs text-slate-400 mb-4">
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
                      : "border-slate-800/80 bg-[#0d1322] hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isEdge
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Page {page}
                    </span>
                  </div>
                  {/* Real page image preview box */}
                  <div className="bg-white rounded overflow-hidden flex items-center justify-center aspect-[1/1.3] shadow-inner">
                    {thumbnails[idx] ? (
                      <img src={thumbnails[idx]} alt={`Page ${page}`} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center text-slate-400">
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
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Split PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Separate one PDF into multiple files or extract pages.</p>
        </div>

        {!fileDetails ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors bg-[#111827] border-slate-800/80 hover:border-blue-500/50 ${
              isDragging ? "border-blue-500 bg-blue-500/5" : ""
            }`}
          >
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 text-blue-400">
              <Upload size={22} />
            </div>
            <p className="text-white font-medium text-sm">Click to browse or drag & drop PDFs</p>
            <p className="text-slate-400 text-xs mt-1">Upload a document to start splitting pages</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-slate-800/80">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{fileDetails.name}</p>
                <p className="text-slate-400 text-xs">{fileDetails.size} • {pageCount} pages</p>
              </div>
              <button 
                onClick={() => { setFileDetails(null); setRawFile(null); setDone(false); setErrorMessage(null); setThumbnails([]); }} 
                className="text-slate-400 hover:text-white shrink-0 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800/80 space-y-4">
              <p className="text-sm font-medium text-white">Split Mode</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleModeChange("range")}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    splitMode === "range" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-[#0d1322] text-slate-300 border border-slate-700/80 hover:bg-slate-800"
                  }`}
                >
                  Extract Page Range
                </button>
                <button
                  onClick={() => handleModeChange("every")}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    splitMode === "every" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-[#0d1322] text-slate-300 border border-slate-700/80 hover:bg-slate-800"
                  }`}
                >
                  Split Every N Pages
                </button>
              </div>

              {splitMode === "range" ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">From Page</label>
                    <input
                      type="number"
                      min="1"
                      max={pageCount}
                      value={fromPage}
                      onChange={(e) => { setFromPage(e.target.value); setSelectingFrom(false); setDone(false); setErrorMessage(null); }}
                      className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">To Page</label>
                    <input
                      type="number"
                      min="1"
                      max={pageCount}
                      value={toPage}
                      onChange={(e) => { setToPage(e.target.value); setSelectingFrom(true); setDone(false); setErrorMessage(null); }}
                      className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">Pages per File</label>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={everyN}
                    onChange={(e) => { setEveryN(e.target.value); setDone(false); setErrorMessage(null); }}
                    className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
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
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto text-sm"
                >
                  {processing && <Loader2 className="animate-spin" size={18} />}
                  {processing ? "Splitting PDF..." : "Split PDF"}
                </button>
              </div>
            )}

            {done && (
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800/80 space-y-4">
                <p className="text-sm font-medium text-white">
                  {splitMode === "range" ? "Download Options" : "Download Split File"}
                </p>

                {splitMode === "range" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => { setDownloadChoice("split"); setErrorMessage(null); }}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        downloadChoice === "split" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-[#0d1322] text-slate-300 border border-slate-700/80 hover:bg-slate-800"
                      }`}
                    >
                      Extracted Segment
                    </button>
                    <button
                      onClick={() => {
                        if (isAllPagesSelected) {
                          setErrorMessage("No remaining pages left to extract because all pages are selected in the range.");
                        } else {
                          setDownloadChoice("remaining");
                          setErrorMessage(null);
                        }
                      }}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        downloadChoice === "remaining" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-[#0d1322] text-slate-300 border border-slate-700/80 hover:bg-slate-800"
                      }`}
                    >
                      Remaining Pages
                    </button>
                  </div>
                )}

                <div className="text-center pt-2">
                  <button
                    onClick={() => executeSplit(splitMode === "range" ? downloadChoice : "split")}
                    disabled={processing || (downloadChoice === "remaining" && isAllPagesSelected)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {processing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    Download {splitMode === "range" ? (downloadChoice === "split" ? "Extracted Segment" : "Remaining Pages") : "Split PDF"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}