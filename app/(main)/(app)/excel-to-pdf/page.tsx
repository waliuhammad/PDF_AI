"use client";

import React, { useState, useRef, JSX } from "react";
import { UploadCard } from "@/components/tools/upload-card";
import { FileSpreadsheet, Trash2, Download, UploadCloud, ShieldCheck, Sparkles, Layers, Sliders } from "lucide-react";
import { loadJsPdfWithAutoTable, loadXlsx } from "@/lib/pdf-libs";

interface SheetData {
  name: string;
  data: any[][];
}

export default function ExcelToPdf(): JSX.Element {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const [startRow, setStartRow] = useState<number>(1);
  const [maxRows, setMaxRows] = useState<number>(60);
  const [startCol, setStartCol] = useState<number>(1);
  const [maxCols, setMaxCols] = useState<number>(70);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (fileList: FileList | null): void => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)");
      return;
    }

    setFileName(file.name);
    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const XLSX = await loadXlsx();
        const workbook = XLSX.read(data, { type: "array" });

        const parsedSheets: SheetData[] = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          return {
            name,
            data: jsonRows.length > 0 ? jsonRows : [["Empty Sheet"]],
          };
        });

        setSheets(parsedSheets);
        setSelectedSheetIndex(0);
      } catch (err: any) {
        setError(err.message || "Failed to parse spreadsheet file.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleClear = (): void => {
    setSheets([]);
    setSelectedSheetIndex(0);
    setFileName("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSlicedData = (fullData: any[][]) => {
    const sRow = Math.max(0, startRow - 1);
    const eRow = sRow + maxRows;
    const sCol = Math.max(0, startCol - 1);
    const eCol = sCol + maxCols;

    const slicedRows = fullData.slice(sRow, eRow);
    return slicedRows.map((row) => row.slice(sCol, eCol));
  };

  const handleConvertToPdf = async (): Promise<void> => {
    if (sheets.length === 0) {
      setError("Please upload a spreadsheet first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { jsPDF, autoTable } = await loadJsPdfWithAutoTable();
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      sheets.forEach((sheet, index) => {
        if (index > 0) {
          doc.addPage();
        }

        doc.setFontSize(14);
        doc.text(`Sheet: ${sheet.name} (Rows ${startRow}-${startRow + maxRows - 1}, Cols ${startCol}-${startCol + maxCols - 1})`, 14, 15);

        const sliced = getSlicedData(sheet.data);
        const headers = sliced[0] || [];
        const rows = sliced.slice(1);

        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 20,
          theme: "grid",
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [51, 65, 85] },
          margin: { left: 14, right: 14 },
        });
      });

      const outputName = fileName ? `${fileName.replace(/\.[^/.]+$/, "")}-custom-range.pdf` : "spreadsheet-export.pdf";
      doc.save(outputName);
    } catch (err: any) {
      setError(err.message || "Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  const currentSheet = sheets[selectedSheetIndex];
  const previewSlicedData = currentSheet ? getSlicedData(currentSheet.data) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 antialiased selection:bg-slate-900 dark:selection:bg-slate-700 selection:text-white">
      <div className="max-w-4xl w-full space-y-8 bg-white dark:bg-[var(--card)] border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl shadow-xl dark:shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-slate-900 dark:text-slate-300" />
            <span>Document Conversion Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Excel to PDF Converter</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Restrict and clip exact rows and columns from your spreadsheets for clean target PDF output.
          </p>
        </div>

        {sheets.length === 0 && (
          <UploadCard
            onFiles={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            title="Click to upload spreadsheet file"
            hint="Supports .xlsx, .xls, and .csv formats"
          />
        )}

        {sheets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[var(--background-secondary)] border border-slate-200 dark:border-slate-700/60 p-4 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px]">{fileName}</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{sheets.length} worksheet(s) found</span>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="inline-flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/20 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove File</span>
              </button>
            </div>

            {sheets.length > 1 && (
              <div className="space-y-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-900 dark:text-slate-400" /> Select Active Worksheet Preview
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sheets.map((s, idx) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSheetIndex(idx)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition shrink-0 cursor-pointer border ${
                        selectedSheetIndex === idx
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm dark:bg-slate-900 dark:border-slate-700"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-[var(--background-secondary)] dark:border-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-[var(--background-secondary)] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-200 text-sm font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">
                <Sliders className="w-4 h-4 text-slate-700 dark:text-slate-400" />
                <span>Row & Column Range Restrictions</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Start Row</label>
                  <input
                    type="number"
                    min={1}
                    value={startRow}
                    onChange={(e) => setStartRow(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white dark:bg-[var(--card)] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Max Rows (e.g. 60)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxRows}
                    onChange={(e) => setMaxRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white dark:bg-[var(--card)] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Start Column</label>
                  <input
                    type="number"
                    min={1}
                    value={startCol}
                    onChange={(e) => setStartCol(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white dark:bg-[var(--card)] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Max Cols (e.g. 70)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxCols}
                    onChange={(e) => setMaxCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white dark:bg-[var(--card)] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 mt-1 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                  />
                </div>
              </div>
            </div>

            {currentSheet && (
              <div className="bg-slate-50 dark:bg-[var(--background-secondary)] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Clipped Range Preview ({previewSlicedData.length} rows x {previewSlicedData[0]?.length || 0} cols)
                </span>
                <div className="max-h-[240px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black/30">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                    <tbody>
                      {previewSlicedData.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-200 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 truncate max-w-[120px]">
                              {cell !== null && cell !== undefined ? String(cell) : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewSlicedData.length > 10 && (
                  <span className="text-[11px] text-slate-500 text-center block">
                    Showing first 10 preview rows of your selected range...
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {sheets.length > 0 && (
          <button
            onClick={handleConvertToPdf}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-900 dark:hover:bg-slate-800 dark:border dark:border-slate-700 active:bg-slate-900 font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg cursor-pointer"
          >
            <Download className="w-5 h-5 text-slate-300" />
            <span>{loading ? "Generating PDF..." : "Convert Restricted Range to PDF"}</span>
          </button>
        )}

        <div className="pt-2 flex items-center justify-center space-x-1.5 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secure client-side spreadsheet range restriction • No file retention</span>
        </div>

      </div>
    </div>
  );
}