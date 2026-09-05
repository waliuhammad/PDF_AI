"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Whether a tool is closed on the plan the person is actually on.
 *
 * A category ceiling of zero is how the config says "this plan does not include
 * the tool" — the same value the server refuses on. Reading it here rather than
 * hard-coding "grammar and translate are Pro" means the lock follows the
 * pricing config: open grammar to Free in Remote Config and the padlock goes
 * away on its own, with nothing to remember to change in the page.
 *
 * Unknown is not locked. If the request fails, or has not landed yet, the page
 * behaves exactly as it did before and the route still refuses — this decides
 * what to draw, never what is allowed.
 */
export function useFeatureLock(category: string): { locked: boolean; plan: string | null } {
    const [state, setState] = useState<{ locked: boolean; plan: string | null }>({
        locked: false,
        plan: null,
    });

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/usage", { signal: controller.signal, cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data?.success) return;
                const limit = data.categories?.[category]?.limit;
                setState({ locked: limit === 0, plan: typeof data.plan === "string" ? data.plan : null });
            })
            .catch(() => {
                // Signed out, offline, or the endpoint is unhappy. None of those
                // are reasons to put a padlock on the page.
            });

        return () => controller.abort();
    }, [category]);

    return state;
}

/**
 * The padlock and the sentence explaining it.
 *
 * Shown where the tool's controls are, before anything is uploaded, because
 * finding out a feature is not on your plan after choosing a file and pressing
 * the button is the worst moment to be told.
 */
export function FeatureLockNotice({ feature }: { feature: string }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 p-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Lock size={18} />
            </div>

            <div className="flex-1">
                <p className="text-sm font-semibold text-fg">{feature} is a Pro feature</p>
                <p className="mt-0.5 text-xs text-muted">
                    This feature requires the Pro or Business plan.
                </p>
            </div>

            <Link
                href="/pricing"
                className="shrink-0 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
                Upgrade
            </Link>
        </div>
    );
}
