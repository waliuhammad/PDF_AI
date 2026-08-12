"use client"

import { useState } from "react"
import type { PlanId, BillingCycle } from "@/lib/plans"
import { PayoneerCheckout } from "@/components/billing/payoneer-checkout"

interface Props {
    planId: PlanId
    cycle: BillingCycle
    label?: string
}

export function CheckoutButton({ planId, cycle, label = "Get started" }: Props) {
    const [open, setOpen] = useState(false)

    if (planId === "free") {
        return (
            // /signup does not exist; the sign-up route is /register, so this
            // sent everyone choosing the free plan to the 404 page.
            <a href="/register" className="block w-full rounded-xl border border-card px-4 py-3 text-center text-fg">
                {label}
            </a>
        )
    }

    if (open) return <PayoneerCheckout planId={planId} cycle={cycle} />

    return (
        <button
            onClick={() => setOpen(true)}
            className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2"
        >
            {label}
        </button>
    )
}