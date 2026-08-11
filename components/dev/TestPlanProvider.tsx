"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

export type TestPlan = "free" | "pro" | "business";

type TestPlanContextType = {
    plan: TestPlan;
    setPlan: (plan: TestPlan) => void;
    isTestMode: boolean;
    isFree: boolean;
    isPro: boolean;
    isBusiness: boolean;
    hasPlan: (requiredPlan: TestPlan) => boolean;
};

const TestPlanContext = createContext<TestPlanContextType | undefined>(
    undefined
);

const STORAGE_KEY = "pdf-aid-test-plan";

const planLevel: Record<TestPlan, number> = {
    free: 0,
    pro: 1,
    business: 2,
};

export function TestPlanProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const enablePlanTester =
        process.env.NEXT_PUBLIC_ENABLE_PLAN_TESTER ?? "true";

    const isTestMode =
        process.env.NODE_ENV !== "production" &&
        enablePlanTester !== "false";

    const [plan, setPlanState] = useState<TestPlan>("free");

    useEffect(() => {
        if (!isTestMode) return;

        const savedPlan = localStorage.getItem(STORAGE_KEY);

        if (
            savedPlan === "free" ||
            savedPlan === "pro" ||
            savedPlan === "business"
        ) {
            setPlanState(savedPlan);
        }
    }, [isTestMode]);

    const setPlan = (newPlan: TestPlan) => {
        setPlanState(newPlan);

        if (isTestMode) {
            localStorage.setItem(STORAGE_KEY, newPlan);
        }
    };

    const hasPlan = (requiredPlan: TestPlan) => {
        if (!isTestMode) {
            return false;
        }

        return planLevel[plan] >= planLevel[requiredPlan];
    };

    const value = useMemo(
        () => ({
            plan,
            setPlan,
            isTestMode,
            isFree: plan === "free",
            isPro: plan === "pro",
            isBusiness: plan === "business",
            hasPlan,
        }),
        [plan, isTestMode]
    );

    return (
        <TestPlanContext.Provider value={value}>
            {children}
        </TestPlanContext.Provider>
    );
}

export function useTestPlanOptional() {
    return useContext(TestPlanContext);
}

export function useTestPlan() {
    const context = useTestPlanOptional();

    if (!context) {
        throw new Error(
            "useTestPlan must be used inside TestPlanProvider"
        );
    }

    return context;
}