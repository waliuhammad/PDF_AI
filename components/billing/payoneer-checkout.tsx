"use client"

import { useEffect, useState } from "react"
import type { PlanId, BillingCycle } from "@/lib/plans"

interface Props {
    planId: PlanId
    cycle: BillingCycle
}

interface StartedPayment {
    reference: string
    amount: number
    payUrl: string
    payeeName?: string
    payeeEmail?: string
    instructions?: string
}

export function PayoneerCheckout({ planId, cycle }: Props) {
    const [started, setStarted] = useState<StartedPayment | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    // Availability is unknown until the first fetch answers. Rendering the pay
    // button during that gap offers something that may not work, so the button
    // waits rather than appearing and then retracting.
    const [available, setAvailable] = useState<boolean | null>(null)

    // The reference lived only in state, so a reload lost the code the payment
    // has to quote while createPayment kept returning that same invoice —
    // leaving the customer with an amount owing and no code.
    useEffect(() => {
        let cancelled = false

        fetch("/api/billing/checkout/payoneer")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (cancelled) return
                setAvailable(data?.available ?? false)
                if (data?.payment?.payUrl) setStarted(data.payment)
            })
            .catch(() => {
                // Offline or the route is down. Treat as unavailable rather
                // than showing a button that cannot work.
                if (!cancelled) setAvailable(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    async function start() {
        setLoading(true)
        setError(null)
        try {
            // The route lives under /checkout; posting to /api/billing/payoneer
            // returned the 404 HTML page, so the JSON parse below failed before
            // any error message could be shown.
            const res = await fetch("/api/billing/checkout/payoneer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, cycle }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setStarted(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not start this payment.")
        } finally {
            setLoading(false)
        }
    }

    function copyReference() {
        if (!started) return
        navigator.clipboard.writeText(started.reference)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!started) {
        if (available === null) {
            return (
                <div
                    className="h-12 w-full animate-pulse rounded-xl bg-[var(--background-secondary)]"
                    aria-label="Checking whether payments are available"
                />
            )
        }

        // The honest state while no Payoneer account is configured. Saying so
        // beats a button that takes an invoice and then strands the customer
        // on a dead link — and it tells them to come back rather than that
        // something went wrong with them.
        if (!available) {
            return (
                <div className="rounded-xl border border-card bg-card px-4 py-3">
                    <p className="text-sm text-fg">Card and Payoneer payments are not available yet.</p>
                    <p className="mt-1 text-sm text-muted">
                        We are finishing setup. Please check back shortly, or contact us to arrange payment.
                    </p>
                </div>
            )
        }

        return (
            <div className="space-y-3">
                <button
                    onClick={start}
                    disabled={loading}
                    className="w-full rounded-xl border border-card bg-card px-4 py-3 text-fg transition hover:bg-[var(--background-secondary)] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                >
                    {loading ? "Preparing your invoice..." : "Pay with Payoneer"}
                </button>
                {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
                <p className="text-sm text-muted">Activated by our team, usually within one business day.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 rounded-2xl border border-card bg-card p-5">
            <div>
                <p className="text-sm text-muted">Amount due</p>
                <p className="text-2xl text-fg">${started.amount.toFixed(2)} USD</p>
            </div>

            {started.instructions && <p className="text-sm text-muted">{started.instructions}</p>}

            <div>
                <p className="text-sm text-muted">
                    Include this code in the payment note. Without it we cannot match your payment to your account.
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 rounded-xl bg-[var(--background-secondary)] px-3 py-2 text-fg">
                        {started.reference}
                    </code>
                    <button
                        onClick={copyReference}
                        className="rounded-xl border border-card px-3 py-2 text-sm text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                    >
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>

            {(started.payeeName || started.payeeEmail) && (
                <div className="rounded-xl bg-[var(--background-secondary)] px-3 py-2">
                    <p className="text-sm text-muted">Paying</p>
                    {started.payeeName && <p className="text-fg">{started.payeeName}</p>}
                    {started.payeeEmail && <p className="text-sm text-muted">{started.payeeEmail}</p>}
                </div>
            )}

            <a
                href={started.payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-[var(--primary)] px-4 py-3 text-center text-white transition hover:opacity-90"
            >
                Open Payoneer to pay
            </a>

            <p className="text-sm text-muted">
                Your plan activates once we confirm the payment. This is a one-time payment and does not renew
                automatically.
            </p>
        </div>
    )
}
