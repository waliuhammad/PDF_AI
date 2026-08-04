"use client";

import {
    collection,
    doc,
    deleteDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    type Timestamp,
} from "firebase/firestore";
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "./client";

/**
 * Documents live at users/{uid}/documents/{docId} in Firestore, with the file
 * itself at users/{uid}/{docId}/{filename} in Storage. The two share the same
 * docId so a metadata row always maps to exactly one object.
 */

export interface StoredDocument {
    id: string;
    name: string;
    /** Raw bytes; the UI formats this for display. */
    bytes: number;
    contentType: string;
    storagePath: string;
    favorite: boolean;
    /** Anthropic Files API id, set the first time this document is sent to the AI. */
    aiFileId: string | null;
    /** Milliseconds since epoch. Null only in the brief window before the
     *  server timestamp resolves on a locally-added document. */
    createdAt: number | null;
}

function documentsCollection(uid: string) {
    return collection(db, "users", uid, "documents");
}

/**
 * Subscribes to the user's documents, newest first. Returns the unsubscribe
 * function. Using a listener rather than a one-off read means an upload or
 * delete in one tab shows up in the others.
 */
export function watchDocuments(
    uid: string,
    onChange: (documents: StoredDocument[]) => void,
    onError?: (error: Error) => void
) {
    const q = query(documentsCollection(uid), orderBy("createdAt", "desc"));

    return onSnapshot(
        q,
        (snapshot) => {
            onChange(
                snapshot.docs.map((snap) => {
                    const data = snap.data();
                    const createdAt = data.createdAt as Timestamp | null;
                    return {
                        id: snap.id,
                        name: data.name ?? "Untitled",
                        bytes: data.bytes ?? 0,
                        contentType: data.contentType ?? "application/octet-stream",
                        storagePath: data.storagePath ?? "",
                        favorite: !!data.favorite,
                        aiFileId: data.aiFileId ?? null,
                        createdAt: createdAt ? createdAt.toMillis() : null,
                    };
                })
            );
        },
        (error) => onError?.(error)
    );
}

export interface UploadHandle {
    /** Resolves once the file is stored and its metadata row is written. */
    done: Promise<StoredDocument>;
    cancel: () => void;
}

/**
 * Uploads a file and writes its metadata row. Progress is reported as 0-100.
 *
 * The Storage upload happens first: if it fails there is no orphaned metadata
 * row, and if the metadata write fails afterwards the object is removed again
 * so the two never drift apart.
 */
export function uploadDocument(
    uid: string,
    file: File,
    onProgress?: (percent: number) => void
): UploadHandle {
    const docRef = doc(documentsCollection(uid));
    const storagePath = `users/${uid}/${docRef.id}/${file.name}`;
    const task = uploadBytesResumable(ref(storage, storagePath), file, {
        contentType: file.type || "application/octet-stream",
    });

    const done = new Promise<StoredDocument>((resolve, reject) => {
        task.on(
            "state_changed",
            (snapshot) => {
                const percent = snapshot.totalBytes
                    ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    : 0;
                onProgress?.(percent);
            },
            reject,
            async () => {
                try {
                    await setDoc(docRef, {
                        name: file.name,
                        bytes: file.size,
                        contentType: file.type || "application/octet-stream",
                        storagePath,
                        favorite: false,
                        aiFileId: null,
                        createdAt: serverTimestamp(),
                    });

                    resolve({
                        id: docRef.id,
                        name: file.name,
                        bytes: file.size,
                        contentType: file.type || "application/octet-stream",
                        storagePath,
                        favorite: false,
                        aiFileId: null,
                        createdAt: Date.now(),
                    });
                } catch (err) {
                    // Don't leave a stored file with no row pointing at it.
                    await deleteObject(ref(storage, storagePath)).catch(() => { });
                    reject(err);
                }
            }
        );
    });

    return { done, cancel: () => task.cancel() };
}

/** Removes the metadata row and the stored file. */
export async function deleteDocument(uid: string, document: StoredDocument) {
    await deleteDoc(doc(documentsCollection(uid), document.id));

    if (document.storagePath) {
        // A missing object shouldn't block removing the row the user asked to delete.
        await deleteObject(ref(storage, document.storagePath)).catch((err) => {
            console.warn("Could not delete the stored file:", err);
        });
    }
}

export async function renameDocument(uid: string, id: string, name: string) {
    await updateDoc(doc(documentsCollection(uid), id), { name });
}

export async function setDocumentFavorite(uid: string, id: string, favorite: boolean) {
    await updateDoc(doc(documentsCollection(uid), id), { favorite });
}

/** Short-lived signed URL for viewing or downloading the file. */
export function getDocumentUrl(storagePath: string) {
    return getDownloadURL(ref(storage, storagePath));
}

/** Remembers the Anthropic file id so the document is only uploaded once. */
export async function setDocumentAiFileId(uid: string, id: string, aiFileId: string) {
    await updateDoc(doc(documentsCollection(uid), id), { aiFileId });
}
