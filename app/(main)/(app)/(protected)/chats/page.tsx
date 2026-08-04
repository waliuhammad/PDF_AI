"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, MessageSquare } from "lucide-react";
import { ChatListItem } from "@/components/chats/chat-list-item";
import { NewChatModal } from "@/components/chats/new-chat-modal";
import { useChats } from "@/hooks/useChats";
import { formatRelativeTime } from "@/lib/utils";

export default function ChatsPage() {
    const router = useRouter();
    const { chats, loading, error, create, remove: removeChat } = useChats();

    const [search, setSearch] = useState("");
    const [showNewChat, setShowNewChat] = useState(false);

    const filteredChats = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return chats;
        return chats.filter(
            (c) =>
                c.title.toLowerCase().includes(query) ||
                c.documentName.toLowerCase().includes(query)
        );
    }, [chats, search]);

    const handleCreate = async (documentId: string, documentName: string, title: string) => {
        const id = await create(documentId, documentName, title);
        setShowNewChat(false);
        router.push(`/chats/${id}`);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-fg">Chats</h1>
                    <p className="text-muted text-sm mt-1">
                        {filteredChats.length} {filteredChats.length === 1 ? "conversation" : "conversations"}
                    </p>
                </div>
                <button
                    onClick={() => setShowNewChat(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
                >
                    <Plus size={16} />
                    New Chat
                </button>
            </div>

            <div className="relative mb-6">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-card text-fg placeholder:text-muted text-sm focus:outline-none focus:border-[var(--primary)] transition-colors bg-card"
                />
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <p className="text-muted text-sm">Loading your chats...</p>
                </div>
            ) : filteredChats.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--background-secondary)] flex items-center justify-center mb-3">
                        <MessageSquare size={20} className="text-muted" />
                    </div>
                    <p className="text-muted text-sm">
                        {chats.length === 0
                            ? "No chats yet — start one from any of your documents."
                            : "No chats match your search."}
                    </p>
                </div>
            ) : (
                <div className="bg-card border border-card rounded-2xl p-2">
                    {filteredChats.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            title={chat.title}
                            pdfName={chat.documentName}
                            lastMessage={chat.lastMessage || "No messages yet"}
                            date={chat.updatedAt ? formatRelativeTime(chat.updatedAt) : "Just now"}
                            onDelete={() => removeChat(chat.id)}
                            onClick={() => router.push(`/chats/${chat.id}`)}
                        />
                    ))}
                </div>
            )}

            {showNewChat && (
                <NewChatModal onClose={() => setShowNewChat(false)} onCreate={handleCreate} />
            )}
        </div>
    );
}
