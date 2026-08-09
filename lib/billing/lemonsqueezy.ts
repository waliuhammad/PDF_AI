import "server-only";
import type { BillingCycle, PlanId } from "@/lib/plans";

/**
 * Server half of billing. Talks to the Lemon Squeezy API with the secret
 * key, so this module must never be imported from client components —
 * the "server-only" import above turns that mistake into a build error.
 *
 * Lemon Squeezy is the merchant of record: the checkout page, card
 * handling, taxes and invoices are all theirs. Our job is only to say
 * *which* variant to sell and *which* user is buying, and to read the
 * webhook later to learn what they bought.
 */

const API_BASE = "https://api.lemonsqueezy.com/v1";

export function billingConfigProblem(): string | null {
    const missing = [
        !process.env.LEMONSQUEEZY_API_KEY && "LEMONSQUEEZY_API_KEY",
        !process.env.LEMONSQUEEZY_STORE_ID && "LEMONSQUEEZY_STORE_ID",
    ].filter(Boolean);
    return missing.length ? `${missing.join(", ")} not set` : null;
}

/** The paid variant for a plan and cycle, or null when unset/unknown. */
export function variantFor(planId: PlanId, cycle: BillingCycle): string | null {
    const table: Record<string, string | undefined> = {
        "pro-monthly": process.env.LS_VARIANT_PRO_MONTHLY,
        "pro-yearly": process.env.LS_VARIANT_PRO_YEARLY,
        "business-monthly": process.env.LS_VARIANT_BUSINESS_MONTHLY,
        "business-yearly": process.env.LS_VARIANT_BUSINESS_YEARLY,
    };
    return table[`${planId}-${cycle}`] ?? null;
}

/**
 * Creates a hosted checkout and returns its URL.
 *
 * The user's uid and chosen plan ride along in checkout_data.custom; the
 * webhook receives them back verbatim, which is how a payment gets matched
 * to a Firestore user without trusting anything the browser says.
 */
export async function createCheckout(options: {
    variantId: string;
    email: string;
    userId: string;
    planId: PlanId;
    redirectUrl: string;
}): Promise<string> {
    const res = await fetch(`${API_BASE}/checkouts`, {
        method: "POST",
        headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({
            data: {
                type: "checkouts",
                attributes: {
                    checkout_data: {
                        email: options.email,
                        custom: {
                            user_id: options.userId,
                            plan_id: options.planId,
                        },
                    },
                    product_options: {
                        redirect_url: options.redirectUrl,
                    },
                },
                relationships: {
                    store: {
                        data: {
                            type: "stores",
                            id: process.env.LEMONSQUEEZY_STORE_ID,
                        },
                    },
                    variant: {
                        data: {
                            type: "variants",
                            id: options.variantId,
                        },
                    },
                },
            },
        }),
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Lemon Squeezy checkout failed (${res.status}): ${detail.slice(0, 300)}`);
    }

    const data = await res.json();
    const url = data?.data?.attributes?.url;
    if (typeof url !== "string") {
        throw new Error("Lemon Squeezy returned no checkout URL.");
    }
    return url;
}