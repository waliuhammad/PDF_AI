"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { useTestPlanOptional } from "@/components/dev/TestPlanProvider";

interface UsageInfo {
    used: number;
    limit: number;
    plan: string;
}

/**
 * "X of Y tool operations used today", read from /api/usage.
 *
 * It says tools rather than AI because the same daily allowance is spent by
 * every metered route — the conversions and the PDF utilities as well as the
 * AI features — so naming only the AI ones understated what the bar measures.
 *
 * Renders nothing while loading or signed out — a meter that can't be
 * filled in honestly is better absent than wrong. When the allowance is
 * exhausted it points at /pricing, which is the actual remedy.
 */
export function UsageMeter({
    /** Drop the card chrome and the header row — the caller supplies its own. */
    hideHeader = false,
    /** Drop just the heading, keeping the plan label. */
    hideTitle = false,
}: {
    hideHeader?: boolean;
    hideTitle?: boolean;
} = {}) {
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    // Distinguishes "still asking" from "cannot answer". Without it the card
    // rendered nothing until the fetch resolved, so on the dashboard it was a
    // gap that filled in a moment later; a skeleton holds its place instead.
    const [unavailable, setUnavailable] = useState(false);
    const testPlan = useTestPlanOptional();

    // The plan tester writes a cookie the API reads, so a switch changes the
    // answer /api/usage gives. Keying the fetch on it means the card follows
    // the toggle; before, it fetched once on mount and then never again, so
    // the card kept showing whatever plan was current at first paint.
    const activePlan = testPlan?.isTestMode ? testPlan.plan : null;

    const load = useCallback(async (signal: AbortSignal) => {
        try {
            const res = await fetch("/api/usage", { signal, cache: "no-store" });
            if (!res.ok) {
                setUnavailable(true);
                return;
            }
            const data = await res.json();
            if (data?.success && Number.isFinite(data.limit)) {
                setUsage({ used: data.used, limit: data.limit, plan: data.plan });
                setUnavailable(false);
            } else {
                setUnavailable(true);
            }
        } catch (err) {
            // An abort is this component replacing its own request, not a
            // failure, and must not blank a card that is about to be filled.
            if ((err as Error)?.name === "AbortError") return;
            setUnavailable(true);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        // The count lives on the server and there is nothing to render until it
        // arrives, so fetch-then-setState in an effect is the correct shape.
        // The request is aborted on cleanup, so a switch mid-flight cannot land
        // a stale plan after the newer one.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load(controller.signal);
        return () => controller.abort();
    }, [load, activePlan]);

    // Usage is consumed by the tool routes, not by this page, so a count taken
    // at mount goes stale as soon as the user runs a tool in another tab.
    // Refreshing when the tab regains focus keeps the card honest.
    useEffect(() => {
        const onFocus = () => {
            const controller = new AbortController();
            load(controller.signal);
        };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [load]);

    const shell = hideHeader ? "" : "bg-card border border-card rounded-2xl p-4 sm:p-6";

    // Nothing to show only once asking has actually failed — signed out, or the
    // endpoint is unreachable. A meter that cannot be filled in honestly is
    // still better absent than wrong.
    if (!usage && unavailable) return null;

    // First load: same footprint as the real card, so the dashboard does not
    // reflow when the numbers arrive. A refetch (plan switch, window focus)
    // keeps the old numbers on screen rather than flashing back to this.
    if (!usage) {
        return (
            <div className={shell}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="h-5 w-40 rounded bg-[var(--background-secondary)] animate-pulse" />
                    <div className="h-3 w-16 rounded bg-[var(--background-secondary)] animate-pulse" />
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--background-secondary)] animate-pulse mb-2" />
                <div className="h-4 w-48 rounded bg-[var(--background-secondary)] animate-pulse" />
            </div>
        );
    }

    const percent = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 100;
    const exhausted = usage.used >= usage.limit;

    return (
        // hideHeader means the caller already drew the card, so drawing another
        // here would nest one panel inside an identical one.
        <div className={shell}>
            {!hideHeader && (
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    {!hideTitle && (
                        <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
                            <Cpu size={17} className="text-[var(--primary)]" />
                            Tools Usage Today
                        </h2>
                    )}
                    <span className="text-xs text-muted capitalize">{usage.plan} plan</span>
                </div>
            )}

            {/* Without the header row the plan would go unstated, and which plan
                the numbers belong to is the point of the card. */}
            {hideHeader && (
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    {!hideTitle && (
                        <span className="text-sm font-semibold text-fg">Tools Usage Today</span>
                    )}
                    <span className="text-xs text-muted capitalize">{usage.plan} plan</span>
                </div>
            )}

            <div className="w-full h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all ${exhausted ? "bg-red-500" : "bg-[var(--primary)]"}`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {exhausted ? (
                <p className="text-sm font-medium text-red-500">
                    Limit reached — {usage.used} of {usage.limit} operations used
                </p>
            ) : (
                <p className="text-sm text-muted">
                    {usage.used} of {usage.limit} operations used
                </p>
            )}

            {exhausted && (
                <Link
                    href="/pricing"
                    className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
                >
                    Upgrade for a higher daily allowance →
                </Link>
            )}
        </div>
    );
}
