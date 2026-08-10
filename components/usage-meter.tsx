"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";

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

    useEffect(() => {
        let cancelled = false;

        fetch("/api/usage")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!cancelled && data?.success) {
                    setUsage({ used: data.used, limit: data.limit, plan: data.plan });
                }
            })
            .catch(() => {
                // Signed out or unreachable — show nothing rather than guesses.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!usage || !Number.isFinite(usage.limit)) return null;

    const percent = Math.min((usage.used / usage.limit) * 100, 100);
    const exhausted = usage.used >= usage.limit;

    return (
        <div className="bg-card border border-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
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

            <p className="text-sm text-muted">
                {usage.used} of {usage.limit} operations used
            </p>

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