"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Send, MessageSquare, Sparkles } from "lucide-react";
import { useChat } from "@/hooks/useChats";
import { formatRelativeTime } from "@/lib/utils";

export function ChatView({ chatId }: { chatId: string }) {
    const { chat, messages, loading, send } = useChat(chatId);

    const [draft, setDraft] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const messageCount = messages.length;

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messageCount]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted">Loading conversation...</p>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="text-center py-20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--background-secondary)] flex items-center justify-center mb-3">
                    <MessageSquare size={20} className="text-muted" />
                </div>
                <h1 className="text-lg font-semibold text-fg mb-1">Chat not found</h1>
                <p className="text-muted text-sm mb-5">This conversation may have been deleted.</p>
                <Link
                    href="/chats"
                    className="inline-block px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
                >
                    Back to Chats
                </Link>
            </div>
        );
    }

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const content = draft.trim();
        if (!content) return;
        send(content);
        setDraft("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 shrink-0">
                <Link
                    href="/chats"
                    className="p-2 rounded-lg text-muted hover:text-fg hover:bg-[var(--background-secondary)] transition-colors"
                    aria-label="Back to chats"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold text-fg truncate">{chat.title}</h1>
                    <p className="text-xs text-muted truncate">
                        {chat.documentName} · {chat.updatedAt ? formatRelativeTime(chat.updatedAt) : "Just now"}
                    </p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Document panel */}
                <div className="hidden lg:flex flex-col bg-card border border-card rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-card shrink-0">
                        <FileText size={16} className="text-[var(--primary)] shrink-0" />
                        <p className="text-sm font-medium text-fg truncate">{chat.documentName}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-6 bg-[var(--background-secondary)]">
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-card border border-card flex items-center justify-center mb-3">
                                <FileText size={24} className="text-muted" />
                            </div>
                            <p className="text-sm text-muted max-w-xs">
                                Document preview appears here once file storage is connected.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat panel */}
                <div className="flex flex-col bg-card border border-card rounded-2xl overflow-hidden min-h-0">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-3">
                                    <Sparkles size={20} className="text-[var(--primary)]" />
                                </div>
                                <p className="text-sm font-medium text-fg mb-1">Ask anything about this document</p>
                                <p className="text-xs text-muted">
                                    Try &ldquo;summarize the key points&rdquo; or &ldquo;what are the main risks?&rdquo;
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${message.role === "user"
                                            ? "bg-[var(--primary)] text-white"
                                            : "bg-[var(--background-secondary)] text-fg"
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-card shrink-0">
                        <input
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Ask a question about this document..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-card text-fg placeholder:text-muted text-sm focus:outline-none focus:border-[var(--primary)] transition-colors bg-card"
                        />
                        <button
                            type="submit"
                            disabled={!draft.trim()}
                            className="p-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
