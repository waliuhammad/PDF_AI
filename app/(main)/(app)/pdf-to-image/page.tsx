"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
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

export default function PdfToImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [mode, setMode] = useState<"whole" | "custom">("whole");
  const [pageNumber, setPageNumber] = useState<string>("1");
  const [imageFormat, setImageFormat] = useState<string>("PNG (.png)");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag and Drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await handleFileSelection(droppedFile);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      await handleFileSelection(selectedFile);
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
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("action", "get-info");

      const response = await fetch("/api/pdf-to-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse PDF file metadata.");
      }

      setNumPages(data.numPages);
      setPageNumber("1");
    } catch (err: any) {
      setError(err.message || "Failed to read PDF structure.");
      setFile(null);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setNumPages(0);
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (mode === "custom") {
      const parsedPage = parseInt(pageNumber, 10);
      if (isNaN(parsedPage) || parsedPage < 1 || parsedPage > numPages) {
        setError(`Please enter a valid page number between 1 and ${numPages}.`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "convert");
      formData.append("mode", mode);
      formData.append("pageNumber", pageNumber);
      formData.append("imageFormat", imageFormat);

      const response = await fetch("/api/pdf-to-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed on the server.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      if (mode === "whole") {
        link.download = `${baseName}_images.zip`;
      } else {
        const extMatch = imageFormat.match(/\(([^)]+)\)/);
        const ext = extMatch ? extMatch[1] : ".png";
        link.download = `${baseName}_page_${pageNumber}${ext}`;
      }

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
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-cyan-950/60 border border-purple-200 dark:border-cyan-800/40 text-purple-900 dark:text-cyan-400 text-xs font-semibold tracking-wide uppercase shadow-sm">
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
        <div className="bg-white dark:bg-[#121622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 space-y-6 transition-colors">
          
          {/* Error / Success Notifications */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Step 1 — Upload PDF */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800/80 hover:border-purple-900 dark:hover:border-cyan-500/50 rounded-2xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50 dark:bg-[#0b0f19] hover:bg-purple-50/30 dark:hover:bg-cyan-500/5 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-purple-100 dark:bg-cyan-500/10 text-purple-900 dark:text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-inner border border-purple-200 dark:border-cyan-500/20">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Drag and drop your PDF here
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">or click to browse from your computer</p>
              <span className="inline-block px-4 py-2 rounded-xl bg-slate-900 dark:bg-[#0d1322] border border-slate-900 dark:border-slate-700 text-white text-sm font-medium shadow-md shadow-slate-900/20 group-hover:bg-slate-800 dark:group-hover:bg-[#111827] transition-colors">
                Browse PDF File
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-cyan-500/10 text-purple-900 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-cyan-500/20">
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

          {/* Step 3 — Conversion Mode Selection */}
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
                      ? "border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-[#0d1322] text-white shadow-md shadow-slate-900/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Layers className="w-4 h-4" /> Whole Document
                </button>
                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    mode === "custom"
                      ? "border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-[#0d1322] text-white shadow-md shadow-slate-900/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <FileText className="w-4 h-4" /> Specific Page
                </button>
              </div>

              {/* Specific Page Input Box */}
              {mode === "custom" && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Page Number (1 to {numPages})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-900 dark:focus:ring-cyan-500 focus:outline-none text-slate-900 dark:text-white bg-white dark:bg-[#121622]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Image Format Selector */}
          {file && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Output Image Format
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-900 dark:focus:ring-cyan-500 focus:outline-none text-slate-900 dark:text-white bg-white dark:bg-[#0b0f19] font-medium"
              >
                <option value="PNG (.png)">PNG (.png)</option>
                <option value="JPEG (.jpg)">JPEG (.jpg)</option>
                <option value="WebP (.webp)">WebP (.webp)</option>
                <option value="BMP (.bmp)">BMP (.bmp)</option>
                <option value="GIF (.gif)">GIF (.gif)</option>
              </select>
            </div>
          )}

          {/* Step 5 & 6 — Convert Button */}
          {file && (
            <button
              onClick={handleConvert}
              disabled={loading || loadingInfo}
              className="w-full py-4 px-6 rounded-xl bg-slate-900 dark:bg-[#0d1322] border border-slate-900 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-[#111827] text-white font-semibold shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Converting Document...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Convert & Download {mode === "whole" ? "All Images (ZIP)" : `Page ${pageNumber}`}
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}