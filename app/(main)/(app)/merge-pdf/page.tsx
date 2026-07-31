"use client";

import { useState, useRef } from "react";
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
}