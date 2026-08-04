"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    deleteDocument,
    renameDocument,
    setDocumentFavorite,
    uploadDocument,
    watchDocuments,
    type StoredDocument,
} from "@/lib/firebase/documents";
import { formatFileSize } from "@/lib/utils";

export interface DocumentView extends StoredDocument {
    /** Formatted for display, e.g. "2.4 MB". */
    size: string;
    /** Megabytes, so the list can sort by size. */
    sizeMb: number;
    /** Null in the brief window before the server timestamp resolves, which
     *  callers should render as "just now" and sort as newest. */
    timestamp: number | null;
}

/**
 * Live view of the signed-in user's documents, backed by Firestore.
 * Replaces the in-memory library store for documents.
 */
export function useDocuments() {
    const { user, loading: authLoading } = useAuth();
    const uid = user?.uid ?? null;

    // The snapshot carries the uid it belongs to, so switching accounts can't
    // briefly show the previous user's documents. Keeping it in one piece of
    // state means the effect only ever calls setState from the subscription
    // callback, never synchronously in its body.
    const [snapshot, setSnapshot] = useState<{
        uid: string | null;
        documents: StoredDocument[];
        error: string | null;
    }>({ uid: null, documents: [], error: null });

    useEffect(() => {
        if (!uid) return;

        return watchDocuments(
            uid,
            (documents) => setSnapshot({ uid, documents, error: null }),
            (err) =>
                setSnapshot({
                    uid,
                    documents: [],
                    error: err.message.includes("insufficient permissions")
                        ? "Your account can't read documents yet — the database rules still need publishing."
                        : err.message,
                })
        );
    }, [uid]);

    const ready = snapshot.uid === uid;
    const loading = authLoading || (!!uid && !ready);
    const error = ready ? snapshot.error : null;

    const view = useMemo<DocumentView[]>(
        () =>
            (ready ? snapshot.documents : []).map((d) => ({
                ...d,
                size: formatFileSize(d.bytes),
                sizeMb: d.bytes / (1024 * 1024),
                timestamp: d.createdAt,
            })),
        [ready, snapshot.documents]
    );

    const upload = useCallback(
        (file: File, onProgress?: (percent: number) => void) => {
            if (!uid) throw new Error("You need to be signed in to upload.");
            return uploadDocument(uid, file, onProgress);
        },
        [uid]
    );

    const remove = useCallback(
        async (id: string) => {
            const target = snapshot.documents.find((d) => d.id === id);
            if (!uid || !target) return;
            await deleteDocument(uid, target);
        },
        [uid, snapshot.documents]
    );

    const rename = useCallback(
        async (id: string, name: string) => {
            if (!uid) return;
            await renameDocument(uid, id, name);
        },
        [uid]
    );

    const toggleFavorite = useCallback(
        async (id: string) => {
            const target = snapshot.documents.find((d) => d.id === id);
            if (!uid || !target) return;
            await setDocumentFavorite(uid, id, !target.favorite);
        },
        [uid, snapshot.documents]
    );

    return { documents: view, loading, error, upload, remove, rename, toggleFavorite };
}
