"use client";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    writeBatch,
    type Timestamp,
} from "firebase/firestore";
import { db } from "./client";

/**
 * Chats live at users/{uid}/chats/{chatId} with their messages in a
 * {chatId}/messages subcollection.
 *
 * The chat row also carries lastMessage and updatedAt. That denormalisation is
 * deliberate: the list view can render a preview and sort by recency from a
 * single subscription, instead of opening one per conversation.
 */

export interface StoredChat {
    id: string;
    title: string;
    /** Id of the document this conversation is about, so the file can be fetched. */
    documentId: string;
    documentName: string;
    lastMessage: string;
    createdAt: number | null;
    updatedAt: number | null;
}

export interface StoredMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number | null;
}

const millis = (value: unknown) =>
    value && typeof value === "object" && "toMillis" in value
        ? (value as Timestamp).toMillis()
        : null;

function chatsCollection(uid: string) {
    return collection(db, "users", uid, "chats");
}

function messagesCollection(uid: string, chatId: string) {
    return collection(db, "users", uid, "chats", chatId, "messages");
}

/** Subscribes to the user's chats, most recently active first. */
export function watchChats(
    uid: string,
    onChange: (chats: StoredChat[]) => void,
    onError?: (error: Error) => void
) {
    return onSnapshot(
        query(chatsCollection(uid), orderBy("updatedAt", "desc")),
        (snapshot) => {
            onChange(
                snapshot.docs.map((snap) => {
                    const data = snap.data();
                    return {
                        id: snap.id,
                        title: data.title ?? "Untitled chat",
                        documentId: data.documentId ?? "",
                        documentName: data.documentName ?? "",
                        lastMessage: data.lastMessage ?? "",
                        createdAt: millis(data.createdAt),
                        updatedAt: millis(data.updatedAt),
                    };
                })
            );
        },
        (error) => onError?.(error)
    );
}

/** Subscribes to one conversation's messages, oldest first. */
export function watchMessages(
    uid: string,
    chatId: string,
    onChange: (messages: StoredMessage[]) => void,
    onError?: (error: Error) => void
) {
    return onSnapshot(
        query(messagesCollection(uid, chatId), orderBy("createdAt", "asc")),
        (snapshot) => {
            onChange(
                snapshot.docs.map((snap) => {
                    const data = snap.data();
                    return {
                        id: snap.id,
                        role: data.role === "assistant" ? "assistant" : "user",
                        content: data.content ?? "",
                        createdAt: millis(data.createdAt),
                    };
                })
            );
        },
        (error) => onError?.(error)
    );
}

export async function createChat(
    uid: string,
    input: { documentId: string; documentName: string; title?: string }
) {
    const created = await addDoc(chatsCollection(uid), {
        title: input.title?.trim() || `Chat about ${input.documentName}`,
        documentId: input.documentId,
        documentName: input.documentName,
        lastMessage: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return created.id;
}

/**
 * Deletes a conversation. Firestore does not cascade, so the messages have to
 * go first or they would linger as unreachable orphans.
 */
export async function deleteChat(uid: string, chatId: string) {
    const messages = await getDocs(messagesCollection(uid, chatId));

    // Batches cap at 500 writes, so chunk rather than assume a short chat.
    for (let i = 0; i < messages.docs.length; i += 450) {
        const batch = writeBatch(db);
        messages.docs.slice(i, i + 450).forEach((snap) => batch.delete(snap.ref));
        await batch.commit();
    }

    await deleteDoc(doc(chatsCollection(uid), chatId));
}

/** Appends a message and keeps the parent chat's preview and ordering current. */
export async function addMessage(
    uid: string,
    chatId: string,
    role: "user" | "assistant",
    content: string
) {
    await addDoc(messagesCollection(uid, chatId), {
        role,
        content,
        createdAt: serverTimestamp(),
    });

    await updateDoc(doc(chatsCollection(uid), chatId), {
        lastMessage: content,
        updatedAt: serverTimestamp(),
    });
}
