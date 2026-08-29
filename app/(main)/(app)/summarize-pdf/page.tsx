"use client";

import { useEffect, useRef, useState } from "react";
import { SecureNote, UploadCard } from "@/components/tools/upload-card";
import { downloadBlob } from "@/lib/download";
import {
  FileText,
  X,
  Copy,
  Sparkles,
  Download,
  ChevronDown,
  FileDown,
} from "lucide-react";
import { errorMessage } from "@/lib/errors";
import { useCancellableRun, wasCancelled } from "@/hooks/useCancellableRun";

export default function SummarizePdfPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { begin, cancel } = useCancellableRun();
  const [fileMeta, setFileMeta] = useState<{ name: string; size: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Controls the format dropdown attached to the Download button.
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Close the download menu on outside click.
  useEffect(() => {
    if (!showDownloadMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDownloadMenu]);

  const handleFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setError(null);
    setSelectedFile(f);
    setFileMeta({ name: f.name, size: formatSize(f.size) });
    setSummary(null);
  };

  const handleSummarize = async () => {
    const signal = begin();
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/summary", {
        method: "POST",
        body: formData, signal
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate summary.");
      }

      const aiSummary = data.result.summary;

      const resultSummary =
        Array.isArray(aiSummary)
          ? aiSummary
          : typeof aiSummary === "string"
          ? aiSummary.split("\n").filter(Boolean)
          : ["No summary returned."];

      setSummary(resultSummary);

    } catch (err) {
      if (wasCancelled(err, signal)) return;
      setError(errorMessage(err, "Something went wrong connecting to the server."));
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Base filename (without extension) used to name downloaded files.
  const baseName = (fileMeta?.name || "document").replace(/\.pdf$/i, "");

  const downloadAsTxt = () => {
    if (!summary) return;
    const content = summary.map((line) => `• ${line}`).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${baseName}_summary.txt`);
    setShowDownloadMenu(false);
  };

  const downloadAsPdf = async () => {
    if (!summary || summary.length === 0) return;

    // Loaded on demand so it doesn't add weight until someone actually
    // exports a PDF.
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // Pull real page dimensions instead of hardcoding them, so pagination
    // works correctly regardless of format/orientation.
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginX = 15;
    const marginTop = 20;
    const marginBottom = 20; // reserved space at bottom for the footer
    const maxWidth = pageWidth - marginX * 2;
    const lineHeight = 7;

    let cursorY = marginTop;
    let pageNumber = 1;

    const drawHeader = () => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", marginX, cursorY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      cursorY += 10;
    };

    const drawFooter = () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        pageWidth - marginX,
        pageHeight - 10,
        { align: "right" }
      );
      doc.setTextColor(0);
      doc.setFontSize(11);
    };

    const addNewPage = () => {
      doc.addPage();
      pageNumber += 1;
      cursorY = marginTop;
    };

    drawHeader();

    summary.forEach((point) => {
      const wrapped = doc.splitTextToSize(`•  ${point}`, maxWidth);

      wrapped.forEach((line: string) => {
        // Check BEFORE drawing so a line never gets clipped at the bottom
        // edge — it rolls to a new page instead.
        if (cursorY + lineHeight > pageHeight - marginBottom) {
          addNewPage();
        }
        doc.text(line, marginX, cursorY);
        cursorY += lineHeight;
      });

      // Small gap between bullet points for readability.
      cursorY += 1.5;
    });

    // Add footers to every page now that the total page count is known.
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      pageNumber = i;
      drawFooter();
    }

    doc.save(`${baseName}_summary.pdf`);
    setShowDownloadMenu(false);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8 text-[#222430] dark:text-white bg-white dark:bg-transparent transition-colors">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-inner bg-[var(--background-secondary)] border border-[#222430]/20 dark:border-white/20 text-[#222430] dark:text-white">
          <Sparkles size={28} />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#222430] dark:text-white">
          Summarize PDF
        </h1>
        <p className="text-[#222430]/70 dark:text-white/80 text-sm mt-1.5 max-w-lg mx-auto">
          Get an AI-generated summary of your document in seconds.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold text-center transition-all">
          ⚠️ {error}
        </div>
      )}

      {!fileMeta ? (
        <UploadCard
          onFiles={handleFile}
          title={"Drag & drop a PDF file here"}
          hint={"or click to browse"}
        />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#222430]/20 dark:border-white/30 bg-[var(--background-secondary)] shadow-sm text-[#222430] dark:text-white">
            <div className="w-9 h-9 rounded-xl border border-[#222430]/20 dark:border-white/30 bg-[#222430]/5 dark:bg-white/5 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate tracking-tight">{fileMeta.name}</p>
              <p className="text-[11px] mt-0.5 text-[#222430]/60 dark:text-white/70 font-medium">
                {fileMeta.size}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                cancel();
                setSelectedFile(null);
                setFileMeta(null);
                setSummary(null);
                setError(null);
              }}
              className="p-2 rounded-xl border border-[#222430]/15 dark:border-white/20 bg-[var(--background-secondary)] transition-all shrink-0 text-[#222430]/70 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 shadow-sm"
              title="Remove File"
            >
              <X size={16} />
            </button>
          </div>

          {summary && (
            <div className="mt-6 p-6 rounded-3xl border border-[#222430]/15 dark:border-white/20 shadow-md bg-[var(--background-secondary)] text-[#222430] dark:text-white transition-colors">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222430]/10 dark:border-white/20">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span className="text-sm font-extrabold">AI Summary</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-2 px-3 rounded-xl border border-[#222430]/10 dark:border-white/20 bg-[var(--background-secondary)] text-[#222430] dark:text-white hover:bg-[#222430] hover:text-white dark:hover:bg-white dark:hover:text-[#222430] transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Copy size={14} />
                    {copied ? "Copied" : "Copy"}
                  </button>

                  {/* Split button: Download opens a small format menu */}
                  <div className="relative" ref={downloadMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowDownloadMenu((prev) => !prev)}
                      className="py-2 px-3 rounded-xl border border-[#222430]/10 dark:border-white/20 bg-[var(--background-secondary)] text-[#222430] dark:text-white hover:bg-[#222430] hover:text-white dark:hover:bg-white dark:hover:text-[#222430] transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Download size={14} />
                      Download
                      <ChevronDown size={12} className={`transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showDownloadMenu && (
                      <div className="absolute right-0 mt-2 w-40 rounded-xl border border-[#222430]/15 dark:border-white/20 bg-[var(--background-secondary)] shadow-lg z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={downloadAsTxt}
                          className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-[#222430]/5 dark:hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <FileText size={14} />
                          Download as .TXT
                        </button>
                        <button
                          type="button"
                          onClick={downloadAsPdf}
                          className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-[#222430]/5 dark:hover:bg-white/10 flex items-center gap-2 border-t border-[#222430]/10 dark:border-white/10 transition-colors"
                        >
                          <FileDown size={14} />
                          Download as .PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {summary.map((line, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-2">
                    <span className="text-[#222430] dark:text-white">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={processing}
              className="py-3 px-8 rounded-xl border border-[#222430]/20 bg-[#222430] text-white hover:bg-[#2f3242] dark:bg-[#2b1b3d] dark:text-white dark:hover:bg-[#382451] font-bold text-sm shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {!summary
                ? processing
                  ? "Summarizing..."
                  : "Summarize with AI"
                : processing
                  ? "Regenerating..."
                  : "Regenerate Summary"}
            </button>
          </div>
        </>
      )}

      <SecureNote />
    </div>
  );
}