"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { ChatListItem } from "@/components/chats/chat-list-item";

interface Chat {
    id: string;
    title: string;
    pdfName: string;
    lastMessage: string;
    date: string;
    timestamp: number;
}

const initialChats: Chat[] = [
    { id: "1", title: "Summarize key findings", pdfName: "Research Paper - Neural Networks.pdf", lastMessage: "The study shows a 12% improvement...", date: "2h ago", timestamp: Date.now() - 2 * 3600000 },
    { id: "2", title: "What's the revenue growth?", pdfName: "Company Financial Report Q3.pdf", lastMessage: "Revenue grew 18% year over year...", date: "1d ago", timestamp: Date.now() - 86400000 },
    { id: "3", title: "Explain clause 4.2", pdfName: "Contract Agreement Draft.pdf", lastMessage: "Clause 4.2 covers termination terms...", date: "3d ago", timestamp: Date.now() - 3 * 86400000 },
    { id: "4", title: "Key milestones this quarter", pdfName: "Product Roadmap 2026.pdf", lastMessage: "Three major milestones are planned...", date: "5d ago", timestamp: Date.now() - 5 * 86400000 },
];

export default function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [search, setSearch] = useState("");

    const filteredChats = useMemo(() => {
        if (!search.trim()) return chats;
        return chats.filter(
            (c) =>
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.pdfName.toLowerCase().includes(search.toLowerCase())
        );
    }, [chats, search]);

    const deleteChat = (id: string) => {
        setChats((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-fg">Chats</h1>
                    <p className="text-muted text-sm mt-1">{filteredChats.length} conversations</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
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

            {filteredChats.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted text-sm">No chats found.</p>
                </div>
            ) : (
                <div className="bg-card border border-card rounded-2xl p-2">
                    {filteredChats.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            title={chat.title}
                            pdfName={chat.pdfName}
                            lastMessage={chat.lastMessage}
                            date={chat.date}
                            onDelete={() => deleteChat(chat.id)}
                            onClick={() => {
                                // TODO: navigate to /chats/[id] once PDF chat split-view page is built
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}