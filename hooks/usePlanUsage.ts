"use client";

import { useCallback, useEffect, useState } from "react";
import { useTestPlanOptional } from "@/components/dev/TestPlanProvider";

export interface PlanUsage {
    used: number;
    limit: number;
    plan: string;
    storageLimitGb: number;
}

/**
 * The signed-in user's plan, daily operation count and storage allowance, from
 * /api/usage.
 *
 * Shared so the usage meter and the storage tile answer from one request and
 * one plan resolution. The fetch is keyed on the plan tester, because that
 * writes the cookie the endpoint reads — without it a switch left the numbers
 * describing the previous plan until a reload.
 */
export function usePlanUsage() {
    const [usage, setUsage] = useState<PlanUsage | null>(null);
    const [unavailable, setUnavailable] = useState(false);
    const testPlan = useTestPlanOptional();

    const activePlan = testPlan?.isTestMode ? testPlan.plan : null;

    const load = useCallback(async (signal: AbortSignal) => {
        try {
            const res = await fetch("/api/usage", { signal, cache: "no-store" });
            if (!res.ok) {
                setUnavailable(true);
                return;
            }
            const data = await res.json();
            if (data?.success) {
                setUsage({
                    used: data.used,
                    limit: data.limit,
                    plan: data.plan,
                    storageLimitGb: data.storageLimitGb,
                });
                setUnavailable(false);
            } else {
                setUnavailable(true);
            }
        } catch (err) {
            // An abort is this hook replacing its own request, not a failure.
            if ((err as Error)?.name === "AbortError") return;
            setUnavailable(true);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load(controller.signal);
        return () => controller.abort();
    }, [load, activePlan]);

    useEffect(() => {
        const onFocus = () => {
            const controller = new AbortController();
            load(controller.signal);
        };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [load]);

    return { usage, unavailable, loading: !usage && !unavailable };
}
