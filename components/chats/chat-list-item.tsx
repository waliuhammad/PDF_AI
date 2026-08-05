"use client";

import { MessageSquare, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface ChatListItemProps {
    title: string;
    pdfName: string;
    lastMessage: string;
    date: string;
    onDelete?: () => void;
    onClick?: () => void;
}

export function ChatListItem({ title, pdfName, lastMessage, date, onDelete, onClick }: ChatListItemProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div
            onClick={onClick}
            className="relative flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[var(--background-secondary)] transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                    <MessageSquare size={18} className="text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{title}</p>
                    <p className="text-xs text-muted truncate">{pdfName} · {lastMessage}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-xs text-muted">{date}</span>
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        className="p-1.5 rounded-lg text-muted hover:text-fg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-8 z-10 w-32 bg-card  border border-card rounded-xl shadow-lg py-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete?.(); setMenuOpen(false); }}
                                className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-600 hover:bg-[var(--background-secondary)]"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}