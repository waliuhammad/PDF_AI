"use client"

import { useEffect, useState } from "react"

interface Payment {
    id: string
    reference: string
    email: string | null
    planId: string
    cycle: string
    amount: number
    createdAt: number | null
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [busy, setBusy] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function load() {
        const res = await fetch("/api/billing/payoneer/pending")
        const data = await res.json()
        if (res.ok) setPayments(data.payments)
        else setError(data.error)
    }

    useEffect(() => {
        load()
    }, [])

    async function act(paymentId: string, action: "confirm" | "reject") {
        setBusy(paymentId)
        setError(null)
        try {
            const res = await fetch("/api/billing/payoneer/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, action }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setPayments((prev) => prev.filter((p) => p.id !== paymentId))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update this payment.")
        } finally {
            setBusy(null)
        }
    }

    return (
        <div className="space-y-4 p-6">
            <h1 className="text-2xl text-fg">Pending payments</h1>
            {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
            {payments.length === 0 && <p className="text-muted">No payments waiting. New ones appear here.</p>}

            {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-card bg-card p-4">
                    <div className="min-w-0">
                        <code className="text-fg">{p.reference}</code>
                        <p className="truncate text-sm text-muted">
                            {p.email} — {p.planId} {p.cycle} — ${p.amount.toFixed(2)}
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <button
                            onClick={() => act(p.id, "confirm")}
                            disabled={busy === p.id}
                            className="rounded-xl bg-[var(--primary)] px-3 py-2 text-sm text-white disabled:opacity-60"
                        >
                            {busy === p.id ? "Working..." : "Confirm"}
                        </button>
                        <button
                            onClick={() => act(p.id, "reject")}
                            disabled={busy === p.id}
                            className="rounded-xl border border-card px-3 py-2 text-sm text-fg disabled:opacity-60"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}