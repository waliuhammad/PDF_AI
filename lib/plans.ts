/**
 * The single source of truth for plans.
 *
 * Pricing cards, the billing tab in settings, plan gating and the checkout
 * endpoint all read from here. Prices are display strings, not numbers,
 * because the real charge amounts live with the payment provider — the
 * website only ever shows them.
 *
 * Yearly shows the per-month equivalent of the yearly charge, so the two
 * columns compare like for like: Pro bills $119.88/year = $9.99/month.
 */

export type PlanId = "free" | "pro" | "business";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
    id: PlanId;
    name: string;
    monthly: string;
    yearly: string;
    /**
     * The same amounts as numbers, for anything that has to charge rather than
     * display. Billing must not parse "$12.99" back into a number: a display
     * string that gains a currency symbol, a comma or a locale format silently
     * becomes NaN, and NaN is an invoice for nothing.
     *
     * yearlyPrice is the per-month equivalent, matching the yearly column, so
     * a one-time yearly invoice is twelve times this.
     */
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    popular?: boolean;
    features: string[];
}

export const PLANS: Plan[] = [
    {
        id: "free",
        name: "Free",
        monthly: "$0",
        yearly: "$0",
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: "Perfect for trying basic PDF tools.",
        features: [
            "Basic PDF conversions",
            "Merge & split PDFs",
            "Limited daily usage",
            "Standard processing speed",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        monthly: "$12.99",
        yearly: "$9.99",
        monthlyPrice: 12.99,
        yearlyPrice: 9.99,
        description: "Advanced tools for professionals.",
        popular: true,
        features: [
            "Unlimited PDF tools",
            "AI PDF Summary",
            "OCR processing",
            "Fast conversions",
            "No advertisements",
        ],
    },
    {
        id: "business",
        name: "Business",
        monthly: "$38.99",
        yearly: "$30.99",
        monthlyPrice: 38.99,
        yearlyPrice: 30.99,
        description: "Powerful PDF workflow for teams.",
        features: [
            "Everything in Pro",
            "Team collaboration",
            "Priority processing",
            "Advanced security",
            "Dedicated support",
        ],
    },
];

export function getPlan(id: PlanId): Plan {
    // PLANS covers every PlanId, so the fallback only guards bad data
    // arriving from outside (e.g. an old Firestore document).
    return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/**
 * Plan hierarchy. A feature requiring "pro" is open to anyone whose rank
 * is at least pro's — so Business users are never locked out of Pro
 * features just because the strings differ.
 */
const PLAN_RANK: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    business: 2,
};

export function planSatisfies(current: PlanId, required: PlanId): boolean {
    return PLAN_RANK[current] >= PLAN_RANK[required];
}