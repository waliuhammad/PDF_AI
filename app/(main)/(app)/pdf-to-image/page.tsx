"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileCheck 
} from "lucide-react";

// Supported image format configurations
const FORMAT_OPTIONS = [
  { label: "PNG Image (.png)", mimeType: "image/png", ext: ".png" },
  { label: "JPEG Image (.jpg)", mimeType: "image/jpeg", ext: ".jpg" },
  { label: "WebP Image (.webp)", mimeType: "image/webp", ext: ".webp" },
  { label: "GIF Image (.gif)", mimeType: "image/gif", ext: ".gif" },
  { label: "BMP Image (.bmp)", mimeType: "image/bmp", ext: ".bmp" },
];

// Helper: Get PDF Page Count from ArrayBuffer
async function getPdfPageCount(arrayBuffer: ArrayBuffer): Promise<number> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}

// Helper: Render & Export Images from ArrayBuffer
async function convertPdfToImages(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  mode: "whole" | "custom",
  pageNumber: number,
  selectedFormat: typeof FORMAT_OPTIONS[number]
): Promise<{ blob: Blob; filename: string }> {
  // Use a copy of the buffer slice to prevent detachment issues
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
  const pdf = await loadingTask.promise;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize canvas context.");

  const { mimeType, ext } = selectedFormat;
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  if (mode === "custom") {
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error("Target page number is out of bounds.");
    }

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.0 });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to generate image blob."));
      }, mimeType);
    });

    return {
      blob,
      filename: `${baseName}_page_${pageNumber}${ext}`,
    };
  } else {
    const zip = new JSZip();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL(mimeType);
      const base64Data = dataUrl.replace(/^data:image\/(png|jpeg|webp|gif|bmp);base64,/, "");
      zip.file(`page_${i}${ext}`, base64Data, { base64: true });
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return {
      blob: zipBlob,
      filename: `${baseName}_images.zip`,
    };
  }
}

export default function PdfToImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [mode, setMode] = useState<"whole" | "custom">("whole");
  const [pageNumber, setPageNumber] = useState<string>("1");
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize PDF.js worker reliably on mount
  useEffect(() => {
    const version = pdfjsLib.version || "3.11.174";
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    setError(null);
    setSuccessMessage(null);

    if (selectedFile.type !== "application/pdf") {
      setError("Invalid file format. Please upload a valid PDF document.");
      return;
    }

    setFile(selectedFile);
    setLoadingInfo(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileBuffer(buffer);
      const pages = await getPdfPageCount(buffer);
      setNumPages(pages);
      setPageNumber("1");
    } catch (err: any) {
      console.error(err);
      setError("Failed to read PDF structure. Ensure the file is not corrupted or password-protected.");
      setFile(null);
      setFileBuffer(null);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileBuffer(null);
    setNumPages(0);
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConvert = async () => {
    if (!file || !fileBuffer) {
      setError("Please upload a PDF file first.");
      return;
    }

    const parsedPage = parseInt(pageNumber, 10);
    if (mode === "custom") {
      if (isNaN(parsedPage) || parsedPage < 1 || parsedPage > numPages) {
        setError(`Please enter a valid page number between 1 and ${numPages}.`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { blob, filename } = await convertPdfToImages(
        fileBuffer,
        file.name,
        mode,
        parsedPage,
        selectedFormat
      );

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessMessage("Conversion completed successfully! Your download has started.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during conversion.");
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 text-purple-900 dark:text-purple-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <FileCheck className="w-4 h-4" /> Professional PDF Toolkit
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PDF to Image Converter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Convert your whole document or a specific targeted page directly into actual image files securely.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 transition-colors">
          
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Upload Drop Zone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-purple-900 dark:hover:border-purple-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/30 dark:hover:bg-slate-800 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-purple-100 dark:bg-slate-800 text-purple-900 dark:text-purple-300 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-inner border border-purple-200 dark:border-slate-700">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Drag and drop your PDF here
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">or click to browse from your computer</p>
              <span className="inline-block px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-900 dark:border-slate-700 text-white text-sm font-medium shadow-md transition-colors">
                Browse PDF File
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-slate-800 text-purple-900 dark:text-purple-300 flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {loadingInfo ? "Analyzing..." : `${numPages} Pages Detected`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Mode Selector */}
          {file && (
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Conversion Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("whole")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    mode === "whole"
                      ? "border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 text-white shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Layers className="w-4 h-4" /> Whole Document
                </button>
                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    mode === "custom"
                      ? "border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 text-white shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-4 h-4" /> Specific Page
                </button>
              </div>

              {mode === "custom" && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Page Number (1 to {numPages})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-900 dark:focus:ring-purple-400 focus:outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                  />
                </div>
              )}
            </div>
          )}

          {/* 5 Format Selector */}
          {file && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Output Image Format
              </label>
              <select
                value={selectedFormat.ext}
                onChange={(e) => {
                  const target = FORMAT_OPTIONS.find((item) => item.ext === e.target.value);
                  if (target) setSelectedFormat(target);
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-900 dark:focus:ring-purple-400 focus:outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-medium"
              >
                {FORMAT_OPTIONS.map((fmt) => (
                  <option key={fmt.ext} value={fmt.ext}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Download Button */}
          {file && (
            <button
              onClick={handleConvert}
              disabled={loading || loadingInfo}
              className="w-full py-4 px-6 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-900 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Converting Document...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Convert & Download {mode === "whole" ? `All Images (${selectedFormat.ext.toUpperCase()} in ZIP)` : `Page ${pageNumber} (${selectedFormat.ext})`}
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}