"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { getPlan, PLANS, planSatisfies, type BillingCycle, type PlanId } from "@/lib/plans"
import { useAuth } from "@/hooks/useAuth"
import { resolvePlan } from "@/lib/firebase/users"

function isPlanId(value: string | null): value is PlanId {
    return value === "free" || value === "pro" || value === "business"
}

function priceFor(planId: PlanId, cycle: BillingCycle): number {
    const plan = getPlan(planId)
    // Each field is the amount for its own cycle.
    return cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
}

const CARD = "rounded-2xl border border-card bg-card"
const BUTTON =
    "inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-white " +
    "transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 disabled:opacity-60"

export default function CheckoutPage() {
    // useSearchParams needs a Suspense boundary above it, or the whole route
    // opts out of static rendering with a build-time warning.
    return (
        <Suspense fallback={<div className="mx-auto h-64 w-full max-w-3xl animate-pulse rounded-2xl bg-[var(--background-secondary)]" />}>
            <Checkout />
        </Suspense>
    )
}

function Checkout() {
    const params = useSearchParams()
    const { profile, loading } = useAuth()

    const requested: PlanId = isPlanId(params.get("plan")) ? (params.get("plan") as PlanId) : "pro"
    const cycle: BillingCycle = params.get("cycle") === "yearly" ? "yearly" : "monthly"

    // Set by Lemon Squeezy's redirect_url. It only means the customer came back
    // from a completed checkout — the plan itself is granted by the webhook, so
    // the page waits to see it rather than believing a query parameter.
    const returned = params.get("paid") === "1"

    // useAuth reads the profile once, when auth settles, so it cannot see the
    // webhook land a few seconds later. Holding the plan here lets the wait
    // below update the summary the moment it confirms.
    const [confirmed, setConfirmed] = useState<PlanId | null>(null)
    const onActive = useCallback((planId: PlanId) => setConfirmed(planId), [])

    if (requested === "free") {
        return (
            <Shell>
                <div className={`${CARD} p-6`}>
                    <h1 className="text-xl text-fg">The Free plan needs no payment</h1>
                    <p className="mt-1 text-sm text-muted">You already have it. Pick Pro or Business to upgrade.</p>
                    <Link href="/pricing" className="mt-4 inline-block rounded-xl bg-[var(--primary)] px-4 py-2.5 text-white">
                        See plans
                    </Link>
                </div>
            </Shell>
        )
    }

    if (loading) {
        return (
            <Shell>
                <div className="h-64 animate-pulse rounded-2xl bg-[var(--background-secondary)]" />
            </Shell>
        )
    }

    const currentPlan = confirmed ?? resolvePlan(profile)

    // Coming back from Lemon Squeezy, the choice has already been made and
    // paid for. Leaving the picker on screen would invite a second purchase
    // while the first is still being confirmed.
    if (returned) {
        return (
            <Shell>
                <Activating planId={requested} onActive={onActive} />
            </Shell>
        )
    }

    return (
        <Shell>
            <PlanChoice selected={requested} cycle={cycle} currentPlan={currentPlan} />
            <div className="mt-5">
                <PayPanel planId={requested} cycle={cycle} />
            </div>
        </Shell>
    )
}
/**
 * Both paid plans, side by side, with the chosen one selected.
 *
 * The page used to show only the plan that was clicked on /pricing, with a
 * "Compare Business" text link that navigated away and back. That put the one
 * decision this page exists to support — is this the right plan? — behind a
 * round trip, and the link disappeared entirely once the visitor was already on
 * the other plan, which is exactly when an upgrade is worth showing.
 *
 * Switching rewrites the query string rather than pushing a new entry, so the
 * back button still goes to /pricing rather than walking through every card the
 * visitor tried. `requested` is read from the URL, so the pay panel below
 * re-checks availability for whichever plan is now selected.
 */
function PlanChoice({
    selected,
    cycle,
    currentPlan,
}: {
    selected: PlanId
    cycle: BillingCycle
    currentPlan: PlanId
}) {
    const router = useRouter()
    const paid = PLANS.filter((p) => p.id !== "free")

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {paid.map((plan) => {
                const isSelected = plan.id === selected
                // planSatisfies rather than equality: someone on Business is
                // not "missing" Pro, so Pro is marked as already covered
                // instead of offered as an upgrade.
                const owned = planSatisfies(currentPlan, plan.id)
                const price = priceFor(plan.id, cycle)

                return (
                    <button
                        key={plan.id}
                        type="button"
                        onClick={() => router.replace(`/checkout?plan=${plan.id}&cycle=${cycle}`, { scroll: false })}
                        aria-pressed={isSelected}
                        className={`${CARD} p-5 text-left transition sm:p-6 ${isSelected
                            ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                            : "hover:border-[var(--primary)]"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h2 className="text-lg text-fg">{plan.name}</h2>
                                <p className="mt-0.5 text-sm text-muted">{plan.description}</p>
                            </div>
                            {/* One badge, not two: "Current plan" is the more
                                useful of the pair when both would apply. */}
                            {owned ? (
                                <span className="shrink-0 rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs text-muted">
                                    Current plan
                                </span>
                            ) : plan.popular ? (
                                <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-1 text-xs text-white">
                                    Popular
                                </span>
                            ) : null}
                        </div>

                        <div className="mt-4 flex items-baseline gap-1.5 border-b border-card pb-4">
                            <span className="text-2xl text-fg">${price.toFixed(2)}</span>
                            <span className="text-sm text-muted">
                                {cycle === "yearly" ? "per year" : "per month"}
                            </span>
                        </div>

                        <ul className="mt-4 space-y-2.5">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex gap-2.5 text-sm text-muted">
                                    <Check size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <p className="mt-4 text-sm">
                            {isSelected ? (
                                <span className="flex items-center gap-1.5 text-[var(--primary)]">
                                    <Check size={15} className="shrink-0" />
                                    Selected
                                </span>
                            ) : (
                                <span className="text-muted underline underline-offset-4">
                                    Choose {plan.name}
                                </span>
                            )}
                        </p>
                    </button>
                )
            })}
        </div>
    )
}
function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
            <div className="mb-5">
                <h1 className="text-2xl text-fg sm:text-3xl">Checkout</h1>
                <p className="mt-1 text-sm text-muted">
                    <Link href="/pricing" className="underline underline-offset-4 hover:text-fg">
                        Back to plans
                    </Link>
                </p>
            </div>
            {children}
        </div>
    )
}

/**
 * The pay button, and what to say when there is nothing behind it.
 *
 * Whether this plan can be bought is asked of the server rather than assumed:
 * the variant ids live in the server's environment, so the browser has no way
 * of knowing that, say, Business yearly was never wired up. Offering a button
 * that answers 503 on click is worse than not offering one.
 */
function PayPanel({ planId, cycle }: { planId: PlanId; cycle: BillingCycle }) {
    const [available, setAvailable] = useState<boolean | null>(null)
    const [starting, setStarting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        fetch(`/api/billing/checkout/lemonsqueezy?plan=${planId}&cycle=${cycle}`)
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) setAvailable(data?.available === true)
            })
            .catch(() => {
                if (!cancelled) setAvailable(false)
            })

        return () => {
            cancelled = true
        }
    }, [planId, cycle])

    useEffect(() => {
        /**
         * Coming back from Lemon Squeezy with the back button, or after
         * cancelling, the browser can restore this page from its back/forward
         * cache with React state exactly as it was left — which means
         * `starting` is still true and the button is stuck reading "Opening
         * checkout…", disabled, with no way to try again short of a reload.
         *
         * Leaving it on is right on the way out: clearing it there would flash
         * an enabled button while the browser is already navigating. It is
         * wrong on the way back, because the navigation it described has
         * already happened and finished.
         *
         * `persisted` is what separates the two — it is only true for a restore
         * from that cache, so a normal load, which starts false anyway, is left
         * alone. Deliberately not visibilitychange: tabbing away and back
         * during a live request would clear a state that is genuinely in
         * flight.
         */
        const onShow = (event: PageTransitionEvent) => {
            if (!event.persisted) return
            setStarting(false)
            setError(null)
        }

        window.addEventListener("pageshow", onShow)
        return () => window.removeEventListener("pageshow", onShow)
    }, [])

    const pay = async () => {
        setStarting(true)
        setError(null)

        try {
            const res = await fetch("/api/billing/checkout/lemonsqueezy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, cycle }),
            })
            const data = await res.json().catch(() => null)

            if (res.ok && data?.url) {
                // assign, not the router: this leaves the app for Lemon
                // Squeezy's own domain, which the client router cannot reach.
                // `starting` is deliberately left on — the page is going away,
                // and clearing it would flash an enabled button on the way out.
                window.location.assign(data.url)
                return
            }

            setError(data?.error ?? "Could not start the payment. Try again.")
        } catch {
            setError("Could not reach the server. Please try again.")
        }

        setStarting(false)
    }

    if (available === null) {
        return (
            <div className={`${CARD} p-5 sm:p-6`}>
                <div className="h-24 animate-pulse rounded-xl bg-[var(--background-secondary)]" />
            </div>
        )
    }

    if (!available) return <Unavailable />

    return (
        <div className={`${CARD} p-5 sm:p-6`}>
            <h2 className="text-lg text-fg">Pay by card</h2>
            <p className="mt-1 text-sm text-muted">
                You will be taken to Lemon Squeezy, our payment provider, to finish the payment. Your
                plan starts as soon as they confirm it.
            </p>

            {error && (
                <p className="mt-3 flex items-start gap-1.5 text-sm text-red-600">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            <button onClick={pay} disabled={starting} className={`mt-4 ${BUTTON}`}>
                {starting && <Loader2 size={15} className="animate-spin" />}
                {starting ? "Opening checkout…" : "Continue to payment"}
            </button>

            <p className="mt-3 text-xs text-muted">
                Card details are handled by Lemon Squeezy. We never see or store them.
            </p>
        </div>
    )
}

/** How long to wait for the webhook before saying so. */
const ACTIVATION_TIMEOUT_MS = 90_000
const POLL_MS = 2_500

/**
 * The wait between paying and the plan actually being granted.
 *
 * Lemon Squeezy sends the customer back the moment their card clears, which is
 * usually before its webhook reaches us — so the honest thing to show is a
 * wait, not a plan. /api/usage is asked because it reports the plan the server
 * resolves from Firestore, which is the same answer every tool and limit uses;
 * anything read in the browser would be the stale profile fetched at sign-in.
 */
function Activating({ planId, onActive }: { planId: PlanId; onActive: (plan: PlanId) => void }) {
    const [state, setState] = useState<"waiting" | "active" | "slow">("waiting")

    useEffect(() => {
        let cancelled = false
        let timer: ReturnType<typeof setTimeout> | undefined
        const startedAt = Date.now()

        const poll = async () => {
            try {
                const res = await fetch("/api/usage", { cache: "no-store" })
                const data = await res.json().catch(() => null)
                if (cancelled) return

                if (data?.plan === planId) {
                    setState("active")
                    onActive(planId)
                    return
                }
            } catch {
                // A dropped request is not a failed payment — keep waiting.
            }

            if (cancelled) return

            if (Date.now() - startedAt >= ACTIVATION_TIMEOUT_MS) {
                setState("slow")
                return
            }

            timer = setTimeout(poll, POLL_MS)
        }

        void poll()

        return () => {
            cancelled = true
            if (timer) clearTimeout(timer)
        }
    }, [planId, onActive])

    if (state === "active") {
        return (
            <div className={`${CARD} p-5 sm:p-6`}>
                <h2 className="flex items-center gap-2 text-lg text-fg">
                    <Check size={18} className="text-[var(--primary)]" />
                    You are on {getPlan(planId).name}
                </h2>
                <p className="mt-1 text-sm text-muted">
                    Your payment went through and the plan is active. Everything it unlocks is
                    available now.
                </p>
                <Link href="/dashboard" className={`mt-4 ${BUTTON}`}>
                    Go to dashboard
                </Link>
            </div>
        )
    }

    if (state === "slow") {
        return (
            <div className={`${CARD} p-5 sm:p-6`}>
                <h2 className="text-lg text-fg">Your payment is still being confirmed</h2>
                <p className="mt-1 text-sm text-muted">
                    This takes longer than usual sometimes, and nothing is wrong with your payment —
                    it will activate on its own. Refresh this page in a few minutes, and{" "}
                    <Link href="/contact" className="underline underline-offset-4 hover:text-fg">
                        contact us
                    </Link>{" "}
                    if it has not by then.
                </p>
            </div>
        )
    }

    return (
        <div className={`${CARD} p-5 sm:p-6`}>
            <h2 className="flex items-center gap-2 text-lg text-fg">
                <Loader2 size={18} className="animate-spin text-[var(--primary)]" />
                Confirming your payment
            </h2>
            <p className="mt-1 text-sm text-muted">
                Thanks — your payment went through. We are waiting for our payment provider to
                confirm it, which usually takes a few seconds. You can leave this page; the plan
                activates either way.
            </p>
        </div>
    )
}

/**
 * Shown when no card payment is configured for this plan.
 *
 * Rather than sending someone who clicked "Get started" to a dead button, the
 * page quotes the plan they picked and points them at /contact.
 */
function Unavailable() {
    return (
        <div className={`${CARD} p-5 sm:p-6`}>
            <h2 className="text-lg text-fg">Online payment is not available yet</h2>
            <p className="mt-1 text-sm text-muted">
                We are setting up card payments for this plan. In the meantime, contact us and we
                will arrange the upgrade with you directly.
            </p>
            <Link href="/contact" className={`mt-4 ${BUTTON}`}>
                Contact us
            </Link>
        </div>
    )
}
