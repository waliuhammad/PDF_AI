"use client";

import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    setDoc,
} from "firebase/firestore";
import { getDb } from "./client";
import type { ChatItem, DocumentItem } from "@/lib/store";

/**
 * Firestore persistence for the user's library.
 *
 * Everything lives under the user's own document — users/{uid}/documents
 * and users/{uid}/chats — which is exactly the shape the security rules
 * protect: a signed-in user can touch their own branch and nobody else's.
 *
 * getDb() resolves to Firestore asynchronously (the SDK is lazy-loaded so
 * pages that never touch the database don't ship it), so every function
 * awaits it before building references.
 *
 * Records keep the same field shapes as the in-memory store (numeric
 * timestamps included), so the store and pages don't translate anything;
 * they just gain persistence.
 */

/** Everything at once: one read on sign-in fills the whole library. */
export async function loadLibrary(
    uid: string
): Promise<{ documents: DocumentItem[]; chats: ChatItem[] }> {
    const db = await getDb();

    const [docsSnap, chatsSnap] = await Promise.all([
        getDocs(collection(db, "users", uid, "documents")),
        getDocs(collection(db, "users", uid, "chats")),
    ]);

    const documents = docsSnap.docs
        .map((d) => d.data() as DocumentItem)
        .sort((a, b) => b.timestamp - a.timestamp);

    const chats = chatsSnap.docs
        .map((d) => d.data() as ChatItem)
        .sort((a, b) => b.timestamp - a.timestamp);

    return { documents, chats };
}

export async function saveDocumentRecord(uid: string, item: DocumentItem): Promise<void> {
    const db = await getDb();
    await setDoc(doc(db, "users", uid, "documents", item.id), item);
}

export async function deleteDocumentRecord(uid: string, id: string): Promise<void> {
    const db = await getDb();
    await deleteDoc(doc(db, "users", uid, "documents", id));
}

export async function saveChatRecord(uid: string, chat: ChatItem): Promise<void> {
    const db = await getDb();
    await setDoc(doc(db, "users", uid, "chats", chat.id), chat);
}

export async function deleteChatRecord(uid: string, id: string): Promise<void> {
    const db = await getDb();
    await deleteDoc(doc(db, "users", uid, "chats", id));
}