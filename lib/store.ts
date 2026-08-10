"use client";

import { create } from "zustand";
import { formatFileSize } from "@/lib/utils";
import {
    deleteChatRecord,
    deleteDocumentRecord,
    saveChatRecord,
    saveDocumentRecord,
} from "@/lib/firebase/library";

/**
 * Client-side library of the user's documents and chats.
 *
 * This remains the single source of truth the documents, chats and
 * dashboard pages read from — but it is now backed by Firestore:
 * `hydrate` fills it from users/{uid}/... on sign-in (see LibraryLoader),
 * and every mutation writes through to the same records.
 *
 * Writes are optimistic: the UI updates immediately and the Firestore
 * write follows. A failed write is logged rather than surfaced —
 * losing one history record beats blocking someone's actual work.
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
    /** The signed-in user everything is persisted under; null = signed out. */
    uid: string | null;

    documents: DocumentItem[];
    chats: ChatItem[];

    /** Called by LibraryLoader on sign-in/out. */
    hydrate: (uid: string | null, documents: DocumentItem[], chats: ChatItem[]) => void;

    addDocuments: (files: { name: string; bytes: number }[]) => void;
    removeDocument: (id: string) => void;
    renameDocument: (id: string, name: string) => void;
    toggleFavorite: (id: string) => void;

    createChat: (pdfName: string, title?: string) => string;
    removeChat: (id: string) => void;
    sendMessage: (chatId: string, content: string) => void;
}

/** Fire-and-forget persistence: log failures, never block the UI. */
function persist(operation: Promise<void>, what: string) {
    operation.catch((err) => console.error(`Failed to save ${what}:`, err));
}

export const useLibrary = create<LibraryState>((set, get) => ({
    uid: null,
    documents: [],
    chats: [],

    hydrate: (uid, documents, chats) => set({ uid, documents, chats }),

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

            if (state.uid) {
                const uid = state.uid;
                added.forEach((item) =>
                    persist(saveDocumentRecord(uid, item), `document "${item.name}"`)
                );
            }

            return { documents: [...added, ...state.documents] };
        }),

    removeDocument: (id) =>
        set((state) => {
            if (state.uid) persist(deleteDocumentRecord(state.uid, id), "document removal");
            return { documents: state.documents.filter((d) => d.id !== id) };
        }),

    renameDocument: (id, name) =>
        set((state) => {
            const documents = state.documents.map((d) => (d.id === id ? { ...d, name } : d));
            const changed = documents.find((d) => d.id === id);
            if (state.uid && changed) persist(saveDocumentRecord(state.uid, changed), "rename");
            return { documents };
        }),

    toggleFavorite: (id) =>
        set((state) => {
            const documents = state.documents.map((d) =>
                d.id === id ? { ...d, favorite: !d.favorite } : d
            );
            const changed = documents.find((d) => d.id === id);
            if (state.uid && changed) persist(saveDocumentRecord(state.uid, changed), "favorite");
            return { documents };
        }),

    createChat: (pdfName, title) => {
        const id = `chat-${Date.now()}`;
        const chat: ChatItem = {
            id,
            title: title?.trim() || `Chat about ${pdfName}`,
            pdfName,
            timestamp: Date.now(),
            messages: [],
        };

        const { uid } = get();
        if (uid) persist(saveChatRecord(uid, chat), "chat");

        set((state) => ({ chats: [chat, ...state.chats] }));
        return id;
    },

    removeChat: (id) =>
        set((state) => {
            if (state.uid) persist(deleteChatRecord(state.uid, id), "chat removal");
            return { chats: state.chats.filter((c) => c.id !== id) };
        }),

    sendMessage: (chatId, content) =>
        set((state) => {
            const chats = state.chats.map((chat) => {
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
            });

            const changed = chats.find((c) => c.id === chatId);
            if (state.uid && changed) persist(saveChatRecord(state.uid, changed), "chat message");

            return { chats };
        }),
}));