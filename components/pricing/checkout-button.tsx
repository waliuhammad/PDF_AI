"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { BillingCycle, Plan } from "@/lib/plans";

/**
 * The buy button on a pricing card.
 *
 * Free plan: a plain link — nothing to purchase.
 * Paid plan, signed out: to /login, then straight back here to finish.
 * Paid plan, signed in: asks the server for a checkout URL and follows it.
 *
 * The endpoint does not exist yet. Rather than pretend, a failed call shows
 * exactly that — the same honesty as the contact form — so the button can
 * ship now and simply start working once the backend lands.
 */
export function CheckoutButton({
    plan,
    billing,
}: {
    plan: Plan;
    billing: BillingCycle;
}) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buttonClass = `
        mt-auto
        block
        w-full
        py-3
        rounded-xl
        text-xs
        md:text-sm
        font-medium
        text-center
        transition-all
        disabled:opacity-60

        ${plan.popular
            ? "bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-95"
            : "border border-border hover:border-primary"
        }
    `;

    if (plan.id === "free") {
        return (
            <Link href="/register" className={buttonClass}>
                Start Free
            </Link>
        );
    }

    const handleCheckout = async () => {
        if (!user) {
            router.push("/login?next=/pricing");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id, billing }),
            });

            const data = await res.json().catch(() => null);

            if (res.ok && data?.url) {
                // The provider's hosted checkout page takes it from here.
                window.location.assign(data.url);
                return;
            }

            setError(
                data?.message ??
                "Checkout isn't connected yet. This button is ready for the backend."
            );
        } catch {
            setError("Could not reach the server. Please try again.");
        }

        setSubmitting(false);
    };

    return (
        <div className="mt-auto w-full">
            {error && (
                <p className="mb-3 flex items-start gap-1.5 text-xs text-red-600">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    {error}
                </p>
            )}

            <button
                onClick={handleCheckout}
                disabled={submitting || loading}
                className={buttonClass}
            >
                {submitting ? (
                    <Loader2 size={16} className="inline animate-spin" />
                ) : (
                    "Upgrade Now"
                )}
            </button>
        </div>
    );
}