"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Download, GripVertical } from "lucide-react";

interface UploadedImage {
    id: string;
    name: string;
    size: string;
    preview: string;
}

export default function ImageToPdfPage() {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragItemIndex = useRef<number | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const addFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        const imgFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
        const newImages: UploadedImage[] = imgFiles.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: formatSize(file.size),
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
        setDone(false);
    };

    const removeImage = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setDone(false);
    };

    const handleDragStart = (index: number) => (dragItemIndex.current = index);
    const handleDragEnter = (index: number) => {
        if (dragItemIndex.current === null || dragItemIndex.current === index) return;
        setImages((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(dragItemIndex.current!, 1);
            updated.splice(index, 0, moved);
            dragItemIndex.current = index;
            return updated;
        });
    };

    const handleConvert = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
        }, 1800);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-0">
            <div className="text-center mb-8 sm:mb-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <ImageIcon className="text-[var(--primary)]" size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-fg">Image to PDF</h1>
                <p className="text-muted text-sm mt-1 px-2 sm:px-0">Combine your images into a single PDF file.</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors ${isDragging ? "border-[var(--primary)] bg-red-50" : "border-card bg-card"
                    }`}
            >
                <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
                <Upload className="mx-auto text-muted mb-3" size={28} />
                <p className="text-fg font-medium text-sm">Drag & drop images here</p>
                <p className="text-muted text-xs mt-1">or tap to browse — JPG, PNG, WEBP, and more supported</p>
            </div>

            {images.length > 0 && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={() => (dragItemIndex.current = null)}
                            className="relative group rounded-xl overflow-hidden border border-card bg-card cursor-grab active:cursor-grabbing"
                        >
                            <img src={img.preview} alt={img.name} className="w-full h-24 object-cover" />
                            <div className="absolute top-1 left-1 bg-black/50 rounded p-0.5">
                                <GripVertical size={12} className="text-white" />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                {index + 1}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {images.length > 0 && (
                <div className="mt-8 text-center">
                    {!done ? (
                        <button
                            onClick={handleConvert}
                            disabled={processing}
                            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                        >
                            {processing ? "Converting..." : `Convert ${images.length} Image${images.length > 1 ? "s" : ""} to PDF`}
                        </button>
                    ) : (
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
                            <Download size={18} />
                            Download PDF
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}