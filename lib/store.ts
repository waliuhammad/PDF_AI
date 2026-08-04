"use client";

import { create } from "zustand";

/**
 * Client-side store for chats.
 *
 * Documents moved to Firestore + Storage (see lib/firebase/documents.ts and
 * hooks/useDocuments.ts); chats are still seeded in memory and are the next
 * thing to move. Replacing the seed and the actions below with Firestore calls
 * is the remaining work — no component has to change.
 */

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
    chats: ChatItem[];

    createChat: (pdfName: string, title?: string) => string;
    removeChat: (id: string) => void;
    sendMessage: (chatId: string, content: string) => void;
}

export const useLibrary = create<LibraryState>((set) => ({
    chats: seedChats(),

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
