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
 * "X of Y AI operations used today", read from /api/usage.
 *
 * Renders nothing while loading or signed out — a meter that can't be
 * filled in honestly is better absent than wrong. When the allowance is
 * exhausted it points at /pricing, which is the actual remedy.
 */
export function UsageMeter() {
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const testPlan = useTestPlanOptional();

    // The plan tester writes a cookie the API reads, so a switch changes the
    // answer /api/usage gives. Keying the fetch on it means the card follows
    // the toggle; before, it fetched once on mount and then never again, so
    // the card kept showing whatever plan was current at first paint.
    const activePlan = testPlan?.isTestMode ? testPlan.plan : null;

    const load = useCallback(async (signal: AbortSignal) => {
        try {
            const res = await fetch("/api/usage", { signal, cache: "no-store" });
            if (!res.ok) return;
            const data = await res.json();
            if (data?.success) {
                setUsage({ used: data.used, limit: data.limit, plan: data.plan });
            }
        } catch {
            // Signed out, aborted, or unreachable — show nothing rather than guesses.
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

    if (!usage || !Number.isFinite(usage.limit)) return null;

    const percent = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 100;
    const exhausted = usage.used >= usage.limit;

    return (
        <div className="bg-card border border-card rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
                    <Cpu size={17} className="text-[var(--primary)]" />
                    AI Usage Today
                </h2>
                <span className="text-xs text-muted capitalize">{usage.plan} plan</span>
            </div>

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
