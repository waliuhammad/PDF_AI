"use client";

import React, { useState, useRef, JSX } from "react";
import { FileSpreadsheet, Trash2, Download, UploadCloud, ShieldCheck, Sparkles, Layers, Sliders } from "lucide-react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  // Range restriction settings per sheet or global
  const [startRow, setStartRow] = useState<number>(1);
  const [maxRows, setMaxRows] = useState<number>(60);
  const [startCol, setStartCol] = useState<number>(1);
  const [maxCols, setMaxCols] = useState<number>(70);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)");
      return;
    }

    setFileName(file.name);
    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
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

  const handleConvertToPdf = (): void => {
    if (sheets.length === 0) {
      setError("Please upload a spreadsheet first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
          headStyles: { fillColor: [41, 128, 185] },
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
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col items-center justify-center p-6 antialiased selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl w-full space-y-8 bg-[#121824] border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Conversion Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Excel to PDF Converter</h1>
          <p className="text-sm text-slate-400">
            Restrict and clip exact rows and columns from your spreadsheets for clean target PDF output.
          </p>
        </div>

        {sheets.length === 0 && (
          <label className="group relative border-2 border-dashed border-slate-700/70 hover:border-blue-500/80 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-[#182030]/50 hover:bg-[#182030] transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-200 text-base mb-1">Click to upload spreadsheet file</span>
            <span className="text-xs text-slate-400">Supports .xlsx, .xls, and .csv formats</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}

        {sheets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#182030] border border-slate-700/60 p-4 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[220px]">{fileName}</h3>
                  <span className="text-[11px] text-slate-400">{sheets.length} worksheet(s) found</span>
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

            {sheets.length > 1 && (
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> Select Active Worksheet Preview
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sheets.map((s, idx) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSheetIndex(idx)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition shrink-0 cursor-pointer border ${
                        selectedSheetIndex === idx
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                          : "bg-[#182030] border-slate-700/60 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Row & Column Restriction Panel */}
            <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-slate-200 text-sm font-semibold border-b border-slate-700 pb-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Row & Column Range Restrictions</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase">Start Row</label>
                  <input
                    type="number"
                    min={1}
                    value={startRow}
                    onChange={(e) => setStartRow(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase">Max Rows (e.g. 60)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxRows}
                    onChange={(e) => setMaxRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase">Start Column</label>
                  <input
                    type="number"
                    min={1}
                    value={startCol}
                    onChange={(e) => setStartCol(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase">Max Cols (e.g. 70)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxCols}
                    onChange={(e) => setMaxCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#121824] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {currentSheet && (
              <div className="bg-[#182030] border border-slate-700/60 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Clipped Range Preview ({previewSlicedData.length} rows x {previewSlicedData[0]?.length || 0} cols)
                </span>
                <div className="max-h-[240px] overflow-auto rounded-xl border border-slate-800 bg-black/30">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <tbody>
                      {previewSlicedData.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-800/60 hover:bg-slate-800/30">
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
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {sheets.length > 0 && (
          <button
            onClick={handleConvertToPdf}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-5 h-5" />
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