"use client";

import { useAuth } from "@/hooks/useAuth";
import { resolvePlan } from "@/lib/firebase/users";
import { getPlan, planSatisfies, type PlanId } from "@/lib/plans";

/**
 * The user's plan, answered from the Firestore profile that useAuth
 * already loads — no extra network request.
 *
 * While auth is still loading, `can` reports false: a locked flash for
 * a paying user beats briefly unlocking premium UI for a free one.
 */
export function usePlan() {
    const { user, profile, loading } = useAuth();

    const planId = resolvePlan(profile);
    const plan = getPlan(planId);

    const can = (required: PlanId): boolean => {
        if (loading) return false;
        return planSatisfies(planId, required);
    };

    return { planId, plan, can, loading, signedIn: !!user };
}