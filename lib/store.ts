"use client";

import { create } from "zustand";
import { formatFileSize } from "@/lib/utils";

/**
 * Client-side library of the user's documents and chats.
 *
 * This is the single source of truth the documents, chats and dashboard pages
 * read from, so counts and recent lists always agree. It starts empty and
 * lives in memory only — swapping the actions below for Firestore/Storage
 * calls is the backend step, and no component has to change.
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
    documents: [],
    chats: [],

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