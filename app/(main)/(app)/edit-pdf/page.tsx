"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Download, Edit3, Plus, Trash2 } from "lucide-react";

type TextItem = { id: number; text: string };

export default function EditPdfPage() {
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [newText, setNewText] = useState("");
    const [items, setItems] = useState<TextItem[]>([]);
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
        setItems([]);
        setDone(false);
    };

    const addText = () => {
        if (!newText.trim()) return;
        setItems((prev) => [...prev, { id: Date.now(), text: newText.trim() }]);
        setNewText("");
    };

    const removeText = (id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const handleSave = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <Edit3 className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">Edit PDF</h1>
                <p className="text-muted text-sm mt-1">Add text directly onto your PDF pages.</p>
            </div>

            {!file ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-white"
                        }`}
                >
                    <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files)} />
                    <Upload className="mx-auto text-muted mb-3" size={28} />
                    <p className="text-fg font-medium text-sm">Drag & drop a PDF file here</p>
                    <p className="text-muted text-xs mt-1">or click to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-card">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-fg text-sm truncate">{file.name}</p>
                            <p className="text-muted text-xs">{file.size}</p>
                        </div>
                        <button onClick={() => { setFile(null); setDone(false); setItems([]); }} className="text-muted hover:text-[var(--primary)] shrink-0">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Page preview with added text overlaid */}
                    <div className="mt-6 relative rounded-2xl border border-card bg-white p-6 h-64 overflow-y-auto">
                        <div className="space-y-2 mb-4">
                            <div className="h-2.5 w-4/5 rounded bg-[var(--background-secondary)]" />
                            <div className="h-2.5 w-full rounded bg-[var(--background-secondary)]" />
                            <div className="h-2.5 w-3/5 rounded bg-[var(--background-secondary)]" />
                        </div>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 bg-red-50 rounded-md px-2 py-1 w-fit">
                                    <span className="text-sm text-[var(--primary)]">{item.text}</span>
                                    <button onClick={() => removeText(item.id)} className="text-[var(--primary)] hover:opacity-70">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add text control */}
                    <div className="mt-6 p-5 rounded-2xl bg-white border border-card">
                        <label className="text-xs text-muted block mb-1">Add text to page</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") addText(); }}
                                placeholder="Type text to insert..."
                                className="flex-1 px-3 py-2 rounded-lg border border-card text-fg text-sm bg-white focus:outline-none focus:border-[var(--primary)]"
                            />
                            <button
                                onClick={addText}
                                disabled={!newText.trim()}
                                className="px-4 rounded-lg bg-[var(--primary)] text-white disabled:opacity-60 hover:bg-[var(--primary-hover)] transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        {!done ? (
                            <button
                                onClick={handleSave}
                                disabled={processing || items.length === 0}
                                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                            >
                                {processing ? "Saving..." : "Save Changes"}
                            </button>
                        ) : (
                            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                <Download size={18} />
                                Download Edited PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}