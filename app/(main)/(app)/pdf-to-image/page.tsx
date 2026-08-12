"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCard } from "@/components/tools/upload-card";
import { loadPdfjs, loadJsZip } from "@/lib/pdf-libs";
import { errorMessage } from "@/lib/errors";
import {
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

const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
};

/**
 * The extension for what the canvas actually produced, not what was asked for.
 *
 * A canvas can only encode a few types - GIF and BMP are not among them in any
 * current browser - and rather than failing it silently returns PNG. Naming the
 * file from the request therefore produced "page_1.gif" holding PNG bytes: the
 * download looked like the wrong kind of file and some viewers refused it.
 */
function extensionFor(actualMime: string, requestedExt: string): string {
  const clean = actualMime.split(";")[0].trim().toLowerCase();
  return EXT_BY_MIME[clean] ?? requestedExt;
}

/** Whether this browser can really encode a type, rather than falling back. */
function canEncode(mimeType: string): boolean {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  return probe.toDataURL(mimeType).startsWith(`data:${mimeType}`);
}

// Helper: Get PDF Page Count from ArrayBuffer
async function getPdfPageCount(arrayBuffer: ArrayBuffer): Promise<number> {
  const pdfjsLib = await loadPdfjs();
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
  const pdfjsLib = await loadPdfjs();
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
      filename: `${baseName}_page_${pageNumber}${extensionFor(blob.type, ext)}`,
    };
  } else {
    const JSZip = await loadJsZip();
    const zip = new JSZip();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL(mimeType);
      // The prefix reports what was really encoded, which is not always what
      // was asked for, so each entry is named after its own bytes.
      const actualMime = dataUrl.slice(5, dataUrl.indexOf(";"));
      const base64Data = dataUrl.replace(/^data:image\/[a-z+.-]+;base64,/, "");
      zip.file(`page_${i}${extensionFor(actualMime, ext)}`, base64Data, { base64: true });
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

  // Only the types this browser can genuinely encode. Offering GIF and BMP was
  // misleading: picking one produced a PNG under a .gif or .bmp name. Resolved
  // on the client because canvas support cannot be known while rendering on the
  // server; PNG is always supported, so the list is never empty.
  const [formatOptions, setFormatOptions] = useState(FORMAT_OPTIONS);

  useEffect(() => {
    const supported = FORMAT_OPTIONS.filter((f) => canEncode(f.mimeType));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormatOptions(supported.length > 0 ? supported : [FORMAT_OPTIONS[0]]);
  }, []);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // The worker is configured by loadPdfjs(), when the library is first needed.

  // Drag and drop is handled by UploadCard; the handlers that used to live here
  // stopped being wired to anything when this page moved onto it.

  const handleFileChange = async (fileList: FileList | null) => {
    if (fileList && fileList[0]) {
      await handleFileSelection(fileList[0]);
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
    } catch (err) {
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
    } catch (err) {
      setError(errorMessage(err, "An unexpected error occurred during conversion."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-card text-fg py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 text-purple-900 dark:text-purple-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <FileCheck className="w-4 h-4" /> Professional PDF Toolkit
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-fg tracking-tight">
            PDF to Image Converter
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
            Convert your whole document or a specific targeted page directly into actual image files securely.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-card rounded-3xl shadow-2xl border border-card p-6 sm:p-8 space-y-6 transition-colors">

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
            <UploadCard
              onFiles={handleFileChange}
              title="Drag and drop your PDF here"
              hint="or click to browse from your computer"
            />
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background-secondary)] border border-card shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-slate-800 text-purple-900 dark:text-purple-300 flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-fg truncate">{file.name}</p>
                  <p className="text-xs text-muted">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                Select Conversion Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("whole")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${mode === "whole"
                    ? "border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 text-white shadow-md"
                    : "border-card bg-[var(--background-secondary)] text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <Layers className="w-4 h-4" /> Whole Document
                </button>
                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${mode === "custom"
                    ? "border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 text-white shadow-md"
                    : "border-card bg-[var(--background-secondary)] text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <FileText className="w-4 h-4" /> Specific Page
                </button>
              </div>

              {mode === "custom" && (
                <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-card space-y-2">
                  <label className="block text-xs font-semibold text-muted">
                    Target Page Number (1 to {numPages})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-card focus:ring-2 focus:ring-purple-900 dark:focus:ring-purple-400 focus:outline-none text-fg bg-card"
                  />
                </div>
              )}
            </div>
          )}

          {/* 5 Format Selector — compact pills rather than a dropdown: five
              known options fit in a small grid, one tap each, no native
              picker sheet covering the screen on phones. Mirrors the mode
              buttons above. */}
          {file && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                Output Image Format
              </label>
              {/* All five formats are listed. The ones this browser cannot
                  encode are disabled rather than hidden, so the list is always
                  the same five and the reason one is unavailable is stated —
                  picking one used to produce a PNG under a .gif or .bmp name. */}
              <select
                value={selectedFormat.ext}
                onChange={(e) => {
                  const target = FORMAT_OPTIONS.find((f) => f.ext === e.target.value);
                  if (target) setSelectedFormat(target);
                }}
                className="w-full sm:max-w-xs px-3 py-2.5 rounded-xl border border-card bg-card text-fg text-sm font-medium focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 transition-colors"
              >
                {FORMAT_OPTIONS.map((fmt) => {
                  const supported = formatOptions.some((f) => f.ext === fmt.ext);

                  return (
                    <option key={fmt.ext} value={fmt.ext} disabled={!supported}>
                      {fmt.label}
                      {supported ? "" : " — not supported by this browser"}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Download Button */}
          {file && (
            <button
              onClick={handleConvert}
              disabled={loading || loadingInfo}
              className="w-full py-4 px-6 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-900 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Converting Document...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 flex-shrink-0" />
                  <span className="text-center">
                    Convert & Download {mode === "whole" ? `All Images (${selectedFormat.ext.replace(".", "").toUpperCase()} in ZIP)` : `Page ${pageNumber} (${selectedFormat.ext})`}
                  </span>
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </main>
  );
}