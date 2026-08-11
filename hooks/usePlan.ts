"use client";

import { useTestPlanOptional } from "@/components/dev/TestPlanProvider";
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
    const testPlan = useTestPlanOptional();

    const effectivePlanId: PlanId = testPlan?.isTestMode
        ? (testPlan.plan as PlanId)
        : resolvePlan(profile);
    const plan = getPlan(effectivePlanId);

    const can = (required: PlanId): boolean => {
        if (loading && !testPlan?.isTestMode) return false;
        return planSatisfies(effectivePlanId, required);
    };

    return {
        planId: effectivePlanId,
        plan,
        can,
        loading: loading && !testPlan?.isTestMode,
        signedIn: !!user || !!testPlan?.isTestMode,
    };
}