"use client";

import { useState, useRef } from "react";
<<<<<<< HEAD
import { Upload, FileText, X, Download } from "lucide-react";

export default function PdfToWordPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
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

    const handleConvert = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 2000);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <FileText className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">PDF to Word</h1>
                <p className="text-muted text-sm mt-1">Convert your PDF into an editable Word document.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
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

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleConvert}
                                disabled={processing}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Converting..." : "Convert to Word"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Word Document
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
=======
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function PdfToWordPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    if (file.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF file.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(false);
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
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
          <FileSpreadsheet className="text-blue-600" size={28} />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-fg tracking-tight">Convert PDF to Word (DOCX)</h1>
        <p className="text-muted text-sm mt-1.5 max-w-lg mx-auto">
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
            isDragging ? "border-blue-500 bg-blue-50/50 scale-[1.01]" : "border-card bg-card hover:border-blue-400"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 mx-auto flex items-center justify-center mb-4 text-blue-600 shadow-sm">
            <Upload size={32} />
          </div>
          <p className="text-fg font-semibold text-lg">Click to browse or drag & drop a PDF</p>
          <p className="text-muted text-sm mt-1">Supports standard text, multi-column blocks, and embedded structures</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card border border-card rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
                <FileText size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-fg text-sm font-bold truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  Size: <strong className="text-fg">{formatSize(selectedFile.size)}</strong>
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
              className="py-4 px-8 rounded-2xl border border-card text-muted hover:text-fg font-bold text-sm transition-colors"
            >
              Select Different File
            </button>
            <button
              type="button"
              onClick={executeConversion}
              disabled={processing}
              className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all"
            >
              {processing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {processing ? "Converting to Word..." : "Convert to Word (.docx)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
>>>>>>> 0635d89 ( commit message here)
}