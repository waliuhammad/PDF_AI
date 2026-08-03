"use client";

import { useState, useRef } from "react";
<<<<<<< HEAD
import { Upload, FileText, X, GripVertical, Download, FileStack } from "lucide-react";

interface UploadedFile {
    id: string;
    file: File;
    name: string;
    size: string;
}

export default function MergePdfPage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [merging, setMerging] = useState(false);
    const [merged, setMerged] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragItemIndex = useRef<number | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const addFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        const pdfFiles = Array.from(fileList).filter((f) => f.type === "application/pdf");
        const newFiles: UploadedFile[] = pdfFiles.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            name: file.name,
            size: formatSize(file.size),
        }));
        setFiles((prev) => [...prev, ...newFiles]);
        setMerged(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setMerged(false);
    };

    // Reorder via drag
    const handleDragStart = (index: number) => {
        dragItemIndex.current = index;
    };

    const handleDragEnter = (index: number) => {
        if (dragItemIndex.current === null || dragItemIndex.current === index) return;
        setFiles((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(dragItemIndex.current!, 1);
            updated.splice(index, 0, moved);
            dragItemIndex.current = index;
            return updated;
        });
    };

    const handleMerge = () => {
        setMerging(true);
        setTimeout(() => {
            setMerging(false);
            setMerged(true);
        }, 1800);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <FileStack className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Merge PDF</h1>
                <p className="text-muted text-sm mt-1">Combine multiple PDFs into one file, in the order you want.</p>
            </div>

            {/* Upload area */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    hidden
                    onChange={(e) => addFiles(e.target.files)}
                />
                <Upload className="mx-auto text-muted mb-3" size={28} />
                <p className="text-fg font-medium text-sm">Drag & drop PDF files here</p>
                <p className="text-muted text-xs mt-1">or click to browse — you can select multiple files</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="mt-6 space-y-2">
                    <p className="text-xs text-muted mb-2">{files.length} file{files.length > 1 ? "s" : ""} — drag to reorder</p>
                    {files.map((f, index) => (
                        <div
                            key={f.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={() => (dragItemIndex.current = null)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical size={16} className="text-muted shrink-0" />
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                <FileText size={16} className="text-[var(--primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-fg text-sm truncate">{f.name}</p>
                                <p className="text-muted text-xs">{f.size}</p>
                            </div>
                            <button onClick={() => removeFile(f.id)} className="text-muted hover:text-[var(--primary)] shrink-0">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Action */}
            {files.length >= 2 && (
                <div className="mt-8 text-center">
                    {!merged ? (
                        <button
                            onClick={handleMerge}
                            disabled={merging}
                            className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                        >
                            {merging ? "Merging..." : `Merge ${files.length} Files`}
                        </button>
                    ) : (
                        <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                            <Download size={18} />
                            Download Merged PDF
                        </button>
                    )}
                </div>
            )}

            {files.length === 1 && (
                <p className="text-center text-muted text-sm mt-6">Add at least one more PDF to merge.</p>
            )}
        </div>
    );
=======
import {
  Upload,
  FileText,
  Layers,
  Download,
  Loader2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Eye,
  Maximize2,
  RotateCw,
  RotateCcw,
} from "lucide-react";

interface PDFSourceFile {
  fileIndex: number;
  file: File;
  name: string;
  size: string;
  sizeBytes: number;
  pageCount: number;
}

interface PageItem {
  id: string;
  fileIndex: number;
  fileName: string;
  localPageIndex: number;
  rotation: number; // e.g. 0, 90, 180, 270, -90, -180
}

export default function MergePdfPage() {
  const [sourceFiles, setSourceFiles] = useState<PDFSourceFile[]>([]);
  const [pagesList, setPagesList] = useState<PageItem[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFilesAdded = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newSourceFiles = [...sourceFiles];
    const newPagesList = [...pagesList];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type !== "application/pdf") continue;

      try {
        const buffer = await file.arrayBuffer();
        const textDecoder = new TextDecoder();
        const text = textDecoder.decode(buffer);
        const matches = text.match(/\/Type\s*\/Page\b/g);
        const pageCount = matches ? matches.length : 1;

        const currentFileIndex = newSourceFiles.length;

        newSourceFiles.push({
          fileIndex: currentFileIndex,
          file,
          name: file.name,
          size: formatSize(file.size),
          sizeBytes: file.size,
          pageCount,
        });

        for (let p = 0; p < pageCount; p++) {
          newPagesList.push({
            id: `${currentFileIndex}-${p}-${Math.random().toString(36).substring(2, 6)}`,
            fileIndex: currentFileIndex,
            fileName: file.name,
            localPageIndex: p,
            rotation: 0,
          });
        }
      } catch (err) {
        console.error("Error reading PDF:", err);
      }
    }

    if (newSourceFiles.length === 0) {
      setErrorMessage("Please select valid PDF files.");
      return;
    }

    setSourceFiles(newSourceFiles);
    setPagesList(newPagesList);
    setErrorMessage(null);
    setActivePreviewIndex(0);
  };

  const movePage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pagesList.length) return;

    const updated = [...pagesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPagesList(updated);
    setActivePreviewIndex(targetIndex);
  };

  const rotatePage = (index: number, direction: "cw" | "ccw") => {
    const updated = [...pagesList];
    const currentPage = updated[index];
    if (!currentPage) return;

    const delta = direction === "cw" ? 90 : -90;
    currentPage.rotation = (currentPage.rotation + delta) % 360;
    setPagesList(updated);
  };

  const removePage = (id: string) => {
    const updated = pagesList.filter((p) => p.id !== id);
    setPagesList(updated);
    if (activePreviewIndex >= updated.length) {
      setActivePreviewIndex(Math.max(0, updated.length - 1));
    }
  };

  const clearAll = () => {
    setSourceFiles([]);
    setPagesList([]);
    setActivePreviewIndex(0);
  };

  const totalOriginalSize = sourceFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const estimatedFinalSize = formatSize(totalOriginalSize * 0.95);

  const executeMerge = async () => {
    if (pagesList.length < 2) {
      setErrorMessage("Please keep at least 2 pages in your merged document.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      sourceFiles.forEach((sf) => {
        formData.append("files", sf.file);
      });

      const pageOrderPayload = pagesList.map((p) => ({
        fileIndex: p.fileIndex,
        pageIndex: p.localPageIndex,
        rotation: p.rotation,
      }));
      formData.append("pageOrder", JSON.stringify(pageOrderPayload));

      const response = await fetch("/api/merge-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || "Failed to merge PDFs.");
        setProcessing(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged_custom_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage("An error occurred while merging your PDF files.");
    } finally {
      setProcessing(false);
    }
  };

  const activePage = pagesList[activePreviewIndex];
  const activeSourceFile = activePage ? sourceFiles.find((f) => f.fileIndex === activePage.fileIndex) : null;
  const activePreviewUrl = activeSourceFile 
    ? `${URL.createObjectURL(activeSourceFile.file)}#page=${activePage.localPageIndex + 1}&view=FitH&toolbar=0&navpanes=0` 
    : "";

  return (
    <div className="max-w-5xl mx-auto w-full px-4">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
          <Layers className="text-blue-600" size={28} />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-fg tracking-tight">Merge, Rotate & Reorder PDF Pages</h1>
        <p className="text-muted text-sm mt-1.5 max-w-lg mx-auto">
          Visually inspect layout structure, preview clear pages in large format, rotate pages in both directions, and sequence your final PDF output.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        hidden
        onChange={(e) => handleFilesAdded(e.target.files)}
      />

      {sourceFiles.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            handleFilesAdded(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-3xl border-2 border-dashed p-16 text-center transition-all ${
            isDraggingFile ? "border-blue-500 bg-blue-50/50 scale-[1.01]" : "border-card bg-card hover:border-blue-400"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 mx-auto flex items-center justify-center mb-4 text-blue-600 shadow-sm">
            <Upload size={32} />
          </div>
          <p className="text-fg font-semibold text-lg">Click to browse or drag & drop PDFs</p>
          <p className="text-muted text-sm mt-1">Upload multiple documents to start combining and re-sequencing pages</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Enhanced Source Files Overview Bar */}
          <div className="bg-card border border-card rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-card">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                <span className="text-sm font-bold text-fg">
                  Uploaded Source Documents ({sourceFiles.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-3.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus size={15} /> Add More PDFs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sourceFiles.map((sf) => (
                <div
                  key={sf.fileIndex}
                  className="p-3.5 rounded-xl bg-[var(--background-secondary)] border border-card flex items-start gap-3 relative group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-fg text-sm font-bold truncate">{sf.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span>Size: <strong className="text-fg">{sf.size}</strong></span>
                      <span>•</span>
                      <span>Pages: <strong className="text-fg">{sf.pageCount}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Large, High-Visibility Page Preview Container */}
          {pagesList.length > 0 && (
            <div className="bg-card border border-card rounded-3xl p-6 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-card">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-blue-600" />
                  <span className="text-sm font-extrabold text-fg">Expanded Sequence & Page Viewer</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 font-bold text-xs">
                  Sequence Position #{activePreviewIndex + 1} of {pagesList.length}
                </div>
              </div>

              {/* Large Central Frame */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--background-secondary)] border border-card relative min-h-[480px]">
                <div className="w-full flex flex-col items-center">
                  <div 
                    className="w-full max-w-md h-[380px] bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden relative flex items-center justify-center transition-transform duration-300"
                    style={{ transform: `rotate(${activePage ? activePage.rotation : 0}deg)` }}
                  >
                    {activePreviewUrl ? (
                      <object
                        data={activePreviewUrl}
                        type="application/pdf"
                        className="w-full h-full pointer-events-none"
                      >
                        <iframe
                          src={activePreviewUrl}
                          className="w-full h-full"
                          title="PDF Large Preview"
                        />
                      </object>
                    ) : (
                      <Loader2 className="animate-spin text-muted" size={28} />
                    )}
                    
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 pointer-events-none">
                      <Maximize2 size={12} /> High-Vis Page View
                    </div>
                  </div>

                  {activePage && (
                    <div className="mt-4 text-center space-y-1">
                      <p className="text-sm text-fg font-bold">
                        Source File: <span className="text-blue-600">{activePage.fileName}</span>
                      </p>
                      <p className="text-xs text-muted">
                        Original Document Page Number: <strong className="text-fg">{activePage.localPageIndex + 1}</strong>
                        {activePage.rotation !== 0 && <span className="ml-2 text-blue-600 font-semibold">({activePage.rotation}° Rotated)</span>}
                      </p>
                    </div>
                  )}
                </div>

                {/* Left/Right Floating High-Visibility Arrows */}
                <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    disabled={activePreviewIndex === 0}
                    onClick={() => setActivePreviewIndex((prev) => Math.max(0, prev - 1))}
                    className="w-12 h-12 rounded-full bg-card border border-card shadow-lg flex items-center justify-center text-fg disabled:opacity-20 pointer-events-auto hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    title="Previous Page"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    disabled={activePreviewIndex === pagesList.length - 1}
                    onClick={() => setActivePreviewIndex((prev) => Math.min(pagesList.length - 1, prev + 1))}
                    className="w-12 h-12 rounded-full bg-card border border-card shadow-lg flex items-center justify-center text-fg disabled:opacity-20 pointer-events-auto hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    title="Next Page"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              </div>

              {/* Prominent Page Reordering, Rotation & Actions Bar */}
              {activePage && (
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--background-secondary)] border border-card shadow-inner">
                  <div className="text-xs font-medium text-muted">
                    Rotate page view (-90° / +90°), shift position, or remove it:
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => rotatePage(activePreviewIndex, "ccw")}
                      className="py-2.5 px-3 rounded-xl bg-card border border-card text-xs font-bold text-fg flex items-center gap-1 hover:border-blue-500 transition-all shadow-sm"
                      title="Rotate 90° Counter-Clockwise (-90°)"
                    >
                      <RotateCcw size={14} /> -90°
                    </button>
                    <button
                      type="button"
                      onClick={() => rotatePage(activePreviewIndex, "cw")}
                      className="py-2.5 px-3 rounded-xl bg-card border border-card text-xs font-bold text-fg flex items-center gap-1 hover:border-blue-500 transition-all shadow-sm"
                      title="Rotate 90° Clockwise (+90°)"
                    >
                      <RotateCw size={14} /> +90°
                    </button>
                    <button
                      type="button"
                      disabled={activePreviewIndex === 0}
                      onClick={() => movePage(activePreviewIndex, "left")}
                      className="py-2.5 px-3 rounded-xl bg-card border border-card text-xs font-bold text-fg disabled:opacity-30 flex items-center gap-1 hover:border-blue-500 transition-all shadow-sm"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      type="button"
                      disabled={activePreviewIndex === pagesList.length - 1}
                      onClick={() => movePage(activePreviewIndex, "right")}
                      className="py-2.5 px-3 rounded-xl bg-card border border-card text-xs font-bold text-fg disabled:opacity-30 flex items-center gap-1 hover:border-blue-500 transition-all shadow-sm"
                    >
                      Fwd <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePage(activePage.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors ml-1"
                      title="Remove Page"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statistics Summary Bar */}
          <div className="p-5 rounded-2xl bg-[var(--background-secondary)] border border-card grid grid-cols-3 gap-4 text-center shadow-sm">
            <div>
              <p className="text-muted text-xs font-semibold">Total Final Pages</p>
              <p className="text-fg text-base font-extrabold mt-1">{pagesList.length} Pages</p>
            </div>
            <div>
              <p className="text-muted text-xs font-semibold">Original Combined Size</p>
              <p className="text-fg text-base font-extrabold mt-1">{formatSize(totalOriginalSize)}</p>
            </div>
            <div>
              <p className="text-muted text-xs font-semibold">Estimated Output Size</p>
              <p className="text-blue-600 text-base font-extrabold mt-1">{estimatedFinalSize}</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {/* Bottom Clear & Action Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={clearAll}
              className="py-4 px-8 rounded-2xl border border-card text-muted hover:text-fg font-bold text-sm transition-colors"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={executeMerge}
              disabled={processing || pagesList.length < 2}
              className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all"
            >
              {processing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {processing ? "Merging PDFs..." : `Merge & Download Final PDF (${pagesList.length} Pages)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}