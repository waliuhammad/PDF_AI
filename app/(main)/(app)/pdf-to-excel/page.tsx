"use client";

import React, { useState, useRef, JSX } from "react";
import { FileText, Trash2, Download, UploadCloud, ShieldCheck, Sparkles, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function PdfToExcel(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [extractedRows, setExtractedRows] = useState<any[][] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.includes("pdf")) {
      setError("Please upload a valid PDF document (.pdf).");
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setExtractedRows(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/pdf-to-excel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to process PDF.");

      setExtractedRows(data.rows || [["No tabular text lines found"]]);
    } catch (err: any) {
      setError(err.message || "An error occurred while parsing the PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFile(null);
    setExtractedRows(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadExcel = (): void => {
    if (!extractedRows || extractedRows.length === 0) return;

    const worksheet = XLSX.utils.aoa_to_sheet(extractedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");

    const safeName = file ? file.name.replace(/\.[^/.]+$/, "") : "pdf-data";
    const outputName = `${safeName}-extracted.xlsx`;
    XLSX.writeFile(workbook, outputName);
  };

  return (
    <div className="min-h-screen bg-background text-fg flex flex-col items-center justify-center p-6 antialiased selection:bg-blue-500 selection:text-fg">
      <div className="max-w-4xl w-full space-y-8 bg-card border border-card p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Conversion Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-fg">PDF to Excel Converter</h1>
          <p className="text-sm text-muted">
            Extract text rows and tables from your PDF documents and export them directly into structured spreadsheets (.xlsx).
          </p>
        </div>

        {!file && (
          <label className="group relative border-2 border-dashed border-card hover:border-blue-500/85 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-[var(--background-secondary)] hover:bg-[var(--background-secondary)] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-fg text-base mb-1">Click to upload PDF document</span>
            <span className="text-xs text-muted">Supports text-based PDF documents</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[var(--background-secondary)] border border-card p-4 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-fg truncate max-w-[220px]">{file.name}</h3>
                  <span className="text-[11px] text-muted">Ready for spreadsheet export</span>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="inline-flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/20 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove File</span>
              </button>
            </div>

            {loading && (
              <div className="text-center py-12 text-muted text-xs animate-pulse">
                Parsing text rows and structuring data from PDF...
              </div>
            )}

            {extractedRows && !loading && (
              <div className="bg-[var(--background-secondary)] border border-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Extracted Rows Preview ({extractedRows.length} rows)
                  </span>
                </div>
                <div className="max-h-[260px] overflow-auto rounded-xl border border-card bg-black/30">
                  <table className="w-full text-left text-xs text-fg border-collapse">
                    <tbody>
                      {extractedRows.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-card hover:bg-[var(--background-secondary)]">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 truncate max-w-[150px]">
                              {cell !== null && cell !== undefined ? String(cell) : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {extractedRows && !loading && (
          <button
            onClick={handleDownloadExcel}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-fg font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download Extracted Excel (.xlsx)</span>
          </button>
        )}

        <div className="pt-2 flex items-center justify-center space-x-1.5 text-muted text-xs">
          <ShieldCheck className="w-4 h-4 text-muted" />
          <span>Secure PDF text extraction • No file retention</span>
        </div>

      </div>
    </div>
  );
}