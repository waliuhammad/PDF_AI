"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HardDrive, Loader2, LogOut, Sparkles } from "lucide-react";
import { logout } from "@/lib/firebase/auth";
import { getPlan, type PlanId } from "@/lib/plans";

/** The plan above this one, or null when there is nothing left to sell. */
const NEXT_PLAN: Record<string, PlanId | null> = {
    free: "pro",
    pro: "business",
    business: null,
};

function isPlanId(value: string): value is PlanId {
    return value === "free" || value === "pro" || value === "business";
}

/**
 * What to do about a library that has run out of room.
 *
 * A full allowance used to be a red line of text ending "remove some documents
 * or upgrade for more space" — a dead end that named two things to do and
 * offered neither. Someone out of space wants to act, so this gives them the
 * two acts that actually resolve it: buy more room, or sign in as somebody who
 * has some.
 *
 * The second is the one people reach for more often than product owners expect.
 * Shared machines, a personal account and a work one — being told you are full
 * with no way through but a payment is a wall, and the sign-in you want is four
 * clicks away through a sidebar.
 */
export function StorageFullNotice({
    usedGb,
    limitGb,
    plan,
    /** The upload-specific line, when this follows a refused upload. */
    detail,
}: {
    usedGb: number;
    limitGb: number;
    plan: string;
    detail?: string;
}) {
    const router = useRouter();
    const [switching, setSwitching] = useState(false);

    const nextPlan = NEXT_PLAN[plan] ?? null;
    const planLabel = isPlanId(plan) ? getPlan(plan).name : plan;

    const switchAccount = async () => {
        setSwitching(true);
        try {
            await logout();
            router.push("/login");
        } finally {
            setSwitching(false);
        }
    };

    return (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <HardDrive size={18} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-fg">
                        Your {planLabel} storage is full
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-muted">
                        {detail ??
                            `You have used ${usedGb.toFixed(2)} GB of your ${limitGb} GB.`}{" "}
                        {/* The next plan is named but its allowance is not: those
                            numbers come from Remote Config and can change without
                            a deploy, so the pricing page stays the one place that
                            states them. */}
                        {nextPlan
                            ? `Upgrade to ${getPlan(nextPlan).name} for more space, or continue on a different account.`
                            : "Remove some documents, or continue on a different account."}
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                        {nextPlan && (
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                <Sparkles size={15} />
                                Upgrade plan
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={switchAccount}
                            disabled={switching}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-card bg-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-fg transition hover:bg-[var(--background-secondary)] disabled:opacity-60"
                        >
                            {switching ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <LogOut size={15} />
                            )}
                            {switching ? "Signing out…" : "Use a different account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
