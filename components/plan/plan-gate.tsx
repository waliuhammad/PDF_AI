"use client";

import Link from "next/link";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { getPlan, type PlanId } from "@/lib/plans";

/**
 * Wraps a premium feature. Entitled users see the children untouched;
 * everyone else sees an upgrade card in their place.
 *
 * This is presentation, not security — anything the browser receives
 * can be unhidden. The API routes enforce the real limits; this exists
 * so free users learn what is premium before hitting a server error.
 */
export function PlanGate({
    required,
    feature,
    children,
}: {
    /** The minimum plan that unlocks this feature. */
    required: Exclude<PlanId, "free">;
    /** Short feature name shown on the card, e.g. "AI PDF Summary". */
    feature: string;
    children: React.ReactNode;
}) {
    const { can, loading, signedIn } = usePlan();

    if (can(required)) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-card bg-card p-10 text-sm text-muted">
                <Loader2 size={15} className="animate-spin" /> Checking your plan…
            </div>
        );
    }

    const requiredPlan = getPlan(required);

    return (
        <div className="rounded-2xl border border-card bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock size={20} />
            </div>

            <h3 className="text-base md:text-lg font-semibold text-fg">
                {feature} is a {requiredPlan.name} feature
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs md:text-sm text-muted">
                {signedIn
                    ? `Upgrade to ${requiredPlan.name} (${requiredPlan.monthly}/month) to unlock ${feature.toLowerCase()} and everything else in the plan.`
                    : `Sign in and upgrade to ${requiredPlan.name} (${requiredPlan.monthly}/month) to unlock ${feature.toLowerCase()}.`}
            </p>

            <Link
                href={signedIn ? "/pricing" : "/login?next=/pricing"}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:opacity-95"
            >
                <Sparkles size={15} />
                {signedIn ? `Upgrade to ${requiredPlan.name}` : "Sign in to upgrade"}
            </Link>
        </div>
    );
}