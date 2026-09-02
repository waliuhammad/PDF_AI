"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { hasSessionHint } from "@/lib/session-hint";

/**
 * The sidebar pulls in Firebase — it shows the account and signs it out — so it
 * is fetched only once we know we are drawing it. Statically imported, its
 * chunk rode along on every anonymous visit to a tool page.
 */
const Sidebar = dynamic(
    () => import("@/components/dashboard/sidebar").then((m) => m.Sidebar),
    { ssr: false }
);

/**
 * Which frame the tool pages get.
 *
 * The tools are usable without an account but live in the signed-in layout, so
 * every visitor was given the app sidebar — Dashboard, My Documents and
 * Settings, all of which bounce a signed-out visitor to the login page.
 *
 * Signed in: the sidebar. Signed out: the marketing header, so the page still
 * has somewhere to go — hiding the sidebar on its own would leave a tool page
 * with no navigation at all.
 *
 * The answer comes from the session hint cookie rather than Firebase Auth.
 * Asking Firebase meant loading the SDK on all twenty-one public tool pages to
 * choose between two layouts, and it could not answer until it had: the old
 * code rendered neither frame while it waited, so a tool page began life with
 * no navigation and grew some a moment later. A cookie is there on the first
 * render, so the right frame is the first one drawn.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
    const [signedIn, setSignedIn] = useState<boolean | null>(null);

    useEffect(() => {
        // After mount, not during render: the server prerenders these pages
        // with no cookies to read, and a first client pass that already knew
        // would not match the HTML it is hydrating.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSignedIn(hasSessionHint());
    }, []);

    const main = (
        <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            {children}
        </main>
    );

    // The single render before the cookie is read. Kept frameless rather than
    // guessing, for the same reason as before: either wrong guess flashes.
    if (signedIn === null) {
        return <div className="min-h-full flex flex-col">{main}</div>;
    }

    if (!signedIn) {
        return (
            <div className="min-h-full flex flex-col">
                {/* Told rather than left to read the same cookie again. */}
                <Navbar signedIn={false} />
                {main}
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col md:flex-row">
            <Sidebar />
            {main}
        </div>
    );
}
