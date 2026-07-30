"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Download } from "lucide-react";

export default function ExcelToPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isExcelFile = (f: File) =>
        f.name.endsWith(".xls") || f.name.endsWith(".xlsx") ||
        f.type === "application/vnd.ms-excel" ||
        f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (!isExcelFile(f)) return;
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
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-tint flex items-center justify-center mb-4">
                    <FileSpreadsheet className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Excel to PDF</h1>
                <p className="text-muted text-sm mt-1">Convert your spreadsheet into a PDF file.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-primary-tint" : "border-card bg-card"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        hidden
                        onChange={(e) => handleFile(e.target.files)}
                    />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop an Excel file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse — .xls or .xlsx</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
                        <div className="w-9 h-9 rounded-lg bg-primary-tint flex items-center justify-center shrink-0">
                            <FileSpreadsheet size={16} className="text-[var(--primary)]" />
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
                                {processing ? "Converting..." : "Convert to PDF"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}