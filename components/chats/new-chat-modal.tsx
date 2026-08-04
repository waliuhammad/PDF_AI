"use client";

import { useState } from "react";
import { X, FileText, Search, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useDocuments } from "@/hooks/useDocuments";

interface NewChatModalProps {
    onClose: () => void;
    /** The id is carried through so the conversation can fetch the file later. */
    onCreate: (documentId: string, documentName: string, title: string) => void;
}

export function NewChatModal({ onClose, onCreate }: NewChatModalProps) {
    const { documents } = useDocuments();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
    const [title, setTitle] = useState("");

    const visible = documents.filter((d) =>
        d.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg bg-card rounded-2xl border border-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-fg">New Chat</h2>
                    <button onClick={onClose} className="text-muted hover:text-fg p-1" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--background-secondary)] flex items-center justify-center mb-3">
                            <MessageSquare size={20} className="text-muted" />
                        </div>
                        <p className="text-sm text-muted mb-4">
                            You need a document before you can start a chat.
                        </p>
                        <Link
                            href="/documents"
                            className="inline-block px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
                        >
                            Upload a PDF
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted mb-3">Choose a document to chat about.</p>

                        <div className="relative mb-3">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search documents..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-card text-fg placeholder:text-muted text-sm focus:outline-none focus:border-[var(--primary)] transition-colors bg-card"
                            />
                        </div>

                        <div className="space-y-1.5 max-h-56 overflow-y-auto mb-4">
                            {visible.length === 0 ? (
                                <p className="text-sm text-muted text-center py-6">No documents match your search.</p>
                            ) : (
                                visible.map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => setSelected({ id: doc.id, name: doc.name })}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${selected?.id === doc.id
                                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                                            : "border-card hover:border-[var(--primary)]"
                                            }`}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                            <FileText size={16} className="text-[var(--primary)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-fg truncate">{doc.name}</p>
                                            <p className="text-xs text-muted">{doc.size}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <label className="block text-sm font-medium text-fg mb-1.5">
                            Chat name <span className="text-muted font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Summarize key findings"
                            className="w-full px-4 py-2.5 rounded-xl border border-card text-fg placeholder:text-muted text-sm focus:outline-none focus:border-[var(--primary)] transition-colors bg-card"
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-full border border-card text-sm text-fg hover:border-[var(--primary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => selected && onCreate(selected.id, selected.name, title)}
                                disabled={!selected}
                                className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {selected ? "Start Chat" : "Select a document"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
