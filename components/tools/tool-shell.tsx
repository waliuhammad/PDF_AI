"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, type LucideIcon } from "lucide-react";

/**
 * Shared chrome for the AI tool pages.
 *
 * The tool pages had drifted apart — different container widths, dropzone
 * styling and accent colours. Anything built on this is consistent by
 * construction rather than by remembering to copy the right classes.
 */

/** The one width every tool page uses. */
export function ToolShell({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                    <Icon className="text-[var(--primary)]" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-fg">{title}</h1>
                <p className="text-muted text-sm mt-1">{description}</p>
            </div>
            {children}
        </div>
    );
}

export function FileDrop({
    accept = ".pdf",
    hint = "PDF only, up to 25 MB",
    onFile,
}: {
    accept?: string;
    hint?: string;
    onFile: (file: File) => void;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const take = (list: FileList | null) => {
        const file = list?.[0];
        if (file) onFile(file);
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); take(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-card bg-card"
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => take(e.target.files)}
            />
            <Upload className="mx-auto text-[var(--primary)] mb-3" size={28} />
            <p className="text-fg font-medium text-sm">Drag &amp; drop a file here</p>
            <p className="text-muted text-xs mt-1">or click to browse — {hint}</p>
        </div>
    );
}

export function SelectedFile({
    name,
    size,
    onClear,
    disabled,
}: {
    name: string;
    size: number;
    onClear: () => void;
    disabled?: boolean;
}) {
    const formatted =
        size < 1024 * 1024
            ? `${(size / 1024).toFixed(0)} KB`
            : `${(size / (1024 * 1024)).toFixed(1)} MB`;

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-fg text-sm truncate">{name}</p>
                <p className="text-muted text-xs">{formatted}</p>
            </div>
            <button
                onClick={onClear}
                disabled={disabled}
                className="text-muted hover:text-fg shrink-0 disabled:opacity-50"
                aria-label="Remove file"
            >
                <X size={16} />
            </button>
        </div>
    );
}

/** The one primary action button style. */
export function RunButton({
    running,
    label,
    runningLabel,
    onClick,
    disabled,
}: {
    running: boolean;
    label: string;
    runningLabel: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <div className="mt-8 text-center">
            <button
                onClick={onClick}
                disabled={running || disabled}
                className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
                {running ? runningLabel : label}
            </button>
        </div>
    );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-6 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-600">
            {children}
        </div>
    );
}
