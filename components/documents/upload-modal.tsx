"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { X, Upload, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: "uploading" | "done" | "error";
    error?: string;
    cancel?: () => void;
}

interface UploadModalProps {
    onClose: () => void;
    /** Performs the real upload; resolves when the file is stored. */
    onUpload: (file: File, onProgress: (percent: number) => void) => { done: Promise<unknown>; cancel: () => void };
}

const MAX_BYTES = 25 * 1024 * 1024; // matches the Storage rule

export function UploadModal({ onClose, onUpload }: UploadModalProps) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const update = (id: string, patch: Partial<UploadFile>) =>
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

    const handleFiles = (fileList: FileList) => {
        const pdfFiles = Array.from(fileList).filter((f) => f.type === "application/pdf");
        if (pdfFiles.length === 0) return;

        for (const file of pdfFiles) {
            const id = `${file.name}-${file.lastModified}-${file.size}`;

            if (file.size > MAX_BYTES) {
                setFiles((prev) => [
                    ...prev,
                    { id, file, progress: 0, status: "error", error: "Larger than the 25 MB limit." },
                ]);
                continue;
            }

            setFiles((prev) => [...prev, { id, file, progress: 0, status: "uploading" }]);

            const handle = onUpload(file, (percent) => update(id, { progress: percent }));
            update(id, { cancel: handle.cancel });

            handle.done
                .then(() => update(id, { progress: 100, status: "done" }))
                .catch((err: unknown) => {
                    const message = err instanceof Error ? err.message : "Upload failed.";
                    update(id, {
                        status: "error",
                        error: message.includes("insufficient permissions")
                            ? "Storage rules haven't been published yet."
                            : message,
                    });
                });
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            prev.find((f) => f.id === id && f.status === "uploading")?.cancel?.();
            return prev.filter((f) => f.id !== id);
        });
    };

    const uploading = files.some((f) => f.status === "uploading");
    const anyDone = files.some((f) => f.status === "done");

    const handleClose = () => {
        // Don't leave half-finished uploads running behind a closed dialog.
        files.filter((f) => f.status === "uploading").forEach((f) => f.cancel?.());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg bg-card rounded-2xl border border-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-fg">Upload PDF</h2>
                    <button onClick={handleClose} className="text-muted hover:text-fg p-1" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragActive ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-card"
                        }`}
                >
                    <Upload size={28} className="text-[var(--primary)]" />
                    <p className="text-sm text-fg font-medium">Drag &amp; drop PDF files here</p>
                    <p className="text-xs text-muted">or click to browse (PDF only, up to 25 MB)</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        multiple
                        className="hidden"
                        onChange={handleInputChange}
                    />
                </div>

                {files.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                        {files.map((f) => (
                            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-card">
                                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                    <FileText size={16} className="text-[var(--primary)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-fg truncate">{f.file.name}</p>
                                    {f.status === "error" ? (
                                        <p className="text-xs text-red-600 mt-0.5">{f.error}</p>
                                    ) : (
                                        <div className="w-full h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden mt-1.5">
                                            <div
                                                className="h-full rounded-full bg-[var(--primary)] transition-all"
                                                style={{ width: `${f.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0">
                                    {f.status === "done" ? (
                                        <CheckCircle2 size={18} className="text-green-600" />
                                    ) : f.status === "error" ? (
                                        <AlertCircle size={18} className="text-red-600" />
                                    ) : (
                                        <Loader2 size={18} className="text-muted animate-spin" />
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFile(f.id)}
                                    className="text-muted hover:text-fg shrink-0"
                                    aria-label={`Remove ${f.file.name}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2.5 rounded-full border border-card text-sm text-fg hover:border-[var(--primary)] transition-colors"
                    >
                        {uploading ? "Cancel" : "Close"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={uploading || !anyDone}
                        className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {files.length === 0 ? "Select files first" : uploading ? "Uploading..." : "Done"}
                    </button>
                </div>
            </div>
        </div>
    );
}
