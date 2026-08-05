"use client";

import { create } from "zustand";
import { formatFileSize } from "@/lib/utils";

/**
 * Client-side library of the user's documents and chats.
 *
 * This is the single source of truth the documents, chats and dashboard pages
 * read from, so counts and recent lists always agree. It is seeded with sample
 * rows and lives in memory only — swapping the seed and the actions below for
 * Firestore/Storage calls is the backend step, and no component has to change.
 */

export interface DocumentItem {
    id: string;
    name: string;
    /** Formatted for display, e.g. "2.4 MB". */
    size: string;
    /** Megabytes, kept separately so the list can sort by size. */
    sizeMb: number;
    timestamp: number;
    favorite: boolean;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface ChatItem {
    id: string;
    title: string;
    pdfName: string;
    messages: ChatMessage[];
    timestamp: number;
}

const HOUR = 3600_000;
const DAY = 86400_000;

function seedDocuments(): DocumentItem[] {
    const now = Date.now();
    return [
        { name: "Research Paper - Neural Networks.pdf", sizeMb: 2.4, age: 2 * HOUR, favorite: true },
        { name: "Company Financial Report Q3.pdf", sizeMb: 5.1, age: DAY, favorite: false },
        { name: "Contract Agreement Draft.pdf", sizeMb: 0.87, age: 3 * DAY, favorite: false },
        { name: "Product Roadmap 2026.pdf", sizeMb: 1.2, age: 5 * DAY, favorite: true },
        { name: "Legal Terms & Conditions.pdf", sizeMb: 0.64, age: 7 * DAY, favorite: false },
        { name: "Marketing Strategy Deck.pdf", sizeMb: 3.8, age: 14 * DAY, favorite: false },
    ].map((d, i) => ({
        id: `seed-doc-${i}`,
        name: d.name,
        size: formatFileSize(d.sizeMb * 1024 * 1024),
        sizeMb: d.sizeMb,
        timestamp: now - d.age,
        favorite: d.favorite,
    }));
}

function seedChats(): ChatItem[] {
    const now = Date.now();
    return [
        {
            title: "Summarize key findings",
            pdfName: "Research Paper - Neural Networks.pdf",
            reply: "The study shows a 12% improvement over the previous baseline, driven mainly by the revised training schedule.",
            age: 2 * HOUR,
        },
        {
            title: "What's the revenue growth?",
            pdfName: "Company Financial Report Q3.pdf",
            reply: "Revenue grew 18% year over year, with the strongest gains in the subscription segment.",
            age: DAY,
        },
        {
            title: "Explain clause 4.2",
            pdfName: "Contract Agreement Draft.pdf",
            reply: "Clause 4.2 covers termination terms, including the 30-day written notice requirement.",
            age: 3 * DAY,
        },
        {
            title: "Key milestones this quarter",
            pdfName: "Product Roadmap 2026.pdf",
            reply: "Three major milestones are planned: the beta launch, the mobile release, and the API rollout.",
            age: 5 * DAY,
        },
    ].map((c, i) => ({
        id: `seed-chat-${i}`,
        title: c.title,
        pdfName: c.pdfName,
        timestamp: now - c.age,
        messages: [
            { id: `seed-chat-${i}-m0`, role: "user" as const, content: c.title, timestamp: now - c.age - 60_000 },
            { id: `seed-chat-${i}-m1`, role: "assistant" as const, content: c.reply, timestamp: now - c.age },
        ],
    }));
}

interface LibraryState {
    documents: DocumentItem[];
    chats: ChatItem[];

    addDocuments: (files: { name: string; bytes: number }[]) => void;
    removeDocument: (id: string) => void;
    renameDocument: (id: string, name: string) => void;
    toggleFavorite: (id: string) => void;

    createChat: (pdfName: string, title?: string) => string;
    removeChat: (id: string) => void;
    sendMessage: (chatId: string, content: string) => void;
}

export const useLibrary = create<LibraryState>((set) => ({
    documents: seedDocuments(),
    chats: seedChats(),

    addDocuments: (files) =>
        set((state) => {
            const now = Date.now();
            const added: DocumentItem[] = files.map((f, i) => ({
                id: `doc-${now}-${i}`,
                name: f.name,
                size: formatFileSize(f.bytes),
                sizeMb: f.bytes / (1024 * 1024),
                timestamp: now,
                favorite: false,
            }));
            return { documents: [...added, ...state.documents] };
        }),

    removeDocument: (id) =>
        set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),

    renameDocument: (id, name) =>
        set((state) => ({
            documents: state.documents.map((d) => (d.id === id ? { ...d, name } : d)),
        })),

    toggleFavorite: (id) =>
        set((state) => ({
            documents: state.documents.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)),
        })),

    createChat: (pdfName, title) => {
        const id = `chat-${Date.now()}`;
        set((state) => ({
            chats: [
                {
                    id,
                    title: title?.trim() || `Chat about ${pdfName}`,
                    pdfName,
                    timestamp: Date.now(),
                    messages: [],
                },
                ...state.chats,
            ],
        }));
        return id;
    },

    removeChat: (id) => set((state) => ({ chats: state.chats.filter((c) => c.id !== id) })),

    sendMessage: (chatId, content) =>
        set((state) => ({
            chats: state.chats.map((chat) => {
                if (chat.id !== chatId) return chat;
                const now = Date.now();
                return {
                    ...chat,
                    timestamp: now,
                    messages: [
                        ...chat.messages,
                        { id: `m-${now}-u`, role: "user" as const, content, timestamp: now },
                        {
                            id: `m-${now}-a`,
                            role: "assistant" as const,
                            // Placeholder until the AI backend is connected.
                            content: `I can't answer that yet — "${chat.pdfName}" hasn't been sent to an AI model. Connecting the backend will replace this reply with a real answer.`,
                            timestamp: now + 1,
                        },
                    ],
                };
            }),
        })),
}));
