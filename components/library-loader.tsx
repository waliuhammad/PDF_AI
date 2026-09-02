"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hasSessionHint } from "@/lib/session-hint";

/**
 * Loads the document library, but only for someone who has one.
 *
 * This is mounted in the layout the twenty-one PDF tools share, and those tools
 * work without an account. The loader needs Firebase Auth and Firestore, so
 * importing it here meant every anonymous visitor to /merge-pdf downloaded both
 * SDKs — around 86KB of auth alone — to synchronise a library they do not have.
 *
 * The real loader now lives behind a dynamic import that only runs when the
 * session hint cookie is present, so the SDKs are fetched by the people they
 * are for. A stale hint costs one wasted import and a load that finds nothing;
 * a missing one costs an unsynchronised library until the next navigation,
 * which is the same as being signed out.
 */
const LibraryLoaderInner = dynamic(
    () => import("./library-loader-inner").then((m) => m.LibraryLoaderInner),
    { ssr: false }
);

export function LibraryLoader() {
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
        // Read after mount: prerendering has no cookies, so deciding during
        // render would make the first client pass disagree with the HTML.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSignedIn(hasSessionHint());
    }, []);

    return signedIn ? <LibraryLoaderInner /> : null;
}
