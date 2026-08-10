"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary } from "@/lib/store";
import { loadLibrary } from "@/lib/firebase/library";

/**
 * Bridges auth to the library store: when a user signs in, their
 * documents and chats are loaded from Firestore into the store; when
 * they sign out, it empties. Renders nothing — mount it once inside the
 * signed-in layout.
 */
export function LibraryLoader() {
    const { user, loading } = useAuth();
    const hydrate = useLibrary((s) => s.hydrate);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            hydrate(null, [], []);
            return;
        }

        let cancelled = false;

        loadLibrary(user.uid)
            .then(({ documents, chats }) => {
                if (!cancelled) hydrate(user.uid, documents, chats);
            })
            .catch((err) => {
                console.error("Failed to load library:", err);
                // Signed in but unreadable: keep uid so new work still saves.
                if (!cancelled) hydrate(user.uid, [], []);
            });

        return () => {
            cancelled = true;
        };
    }, [user, loading, hydrate]);

    return null;
}