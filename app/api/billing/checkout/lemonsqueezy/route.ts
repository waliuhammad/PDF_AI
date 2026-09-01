import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminAuth, isAdminConfigured, SESSION_COOKIE } from "@/lib/firebase/admin"
import {
    canCheckout,
    createCheckout,
    isLemonSqueezyConfigured,
    lemonSqueezyProblem,
    type PaidPlanId,
} from "@/lib/billing/lemonsqueezy"
import { getSiteUrl } from "@/lib/site-url"
import type { BillingCycle, PlanId } from "@/lib/plans"

// firebase-admin needs Node, not Edge — same reason proxy.ts runs on Node.
export const runtime = "nodejs"

const PAID_PLANS: PlanId[] = ["pro", "business"]

/**
 * Starts a card payment.
 *
 * Returns a URL rather than redirecting: the caller is `fetch` from the
 * checkout page, and a 3xx to a cross-origin host is not something fetch can
 * follow into the address bar. The page does the navigating.
 */
export async function POST(req: Request) {
    if (!isAdminConfigured()) {
        return NextResponse.json({ error: "Payments are not available right now." }, { status: 503 })
    }

    const session = (await cookies()).get(SESSION_COOKIE)?.value
    if (!session) {
        return NextResponse.json({ error: "Sign in to continue." }, { status: 401 })
    }

    let uid: string
    let email: string | null
    try {
        // checkRevoked, so a signed-out-everywhere session cannot still buy.
        const decoded = await getAdminAuth().verifySessionCookie(session, true)
        uid = decoded.uid
        email = decoded.email ?? null
    } catch {
        return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const planId = body?.planId as PlanId
    const cycle = body?.cycle as BillingCycle

    // Validated against plans.ts. The client sends a plan name, never a price —
    // the amount charged is whatever the Lemon Squeezy variant says it is.
    if (!PAID_PLANS.includes(planId)) {
        return NextResponse.json({ error: "Choose a paid plan." }, { status: 400 })
    }
    if (cycle !== "monthly" && cycle !== "yearly") {
        return NextResponse.json({ error: "Choose monthly or yearly billing." }, { status: 400 })
    }

    if (!isLemonSqueezyConfigured()) {
        console.error(`[lemonsqueezy] refusing to open checkout: ${lemonSqueezyProblem()}`)
        return NextResponse.json(
            { error: "Card payments are not available right now." },
            { status: 503 }
        )
    }

    if (!canCheckout(planId as PaidPlanId, cycle)) {
        console.error(`[lemonsqueezy] no variant configured for ${planId}/${cycle}`)
        return NextResponse.json(
            { error: "That plan is not available for card payment yet." },
            { status: 503 }
        )
    }

    // `paid=1` only means the customer came back from a completed checkout — it
    // is not proof of anything, and the page still waits for the webhook before
    // showing the plan as active. A query parameter is not a payment.
    const redirectUrl = `${getSiteUrl()}/checkout?plan=${planId}&cycle=${cycle}&paid=1`

    try {
        const url = await createCheckout({
            uid,
            email,
            planId: planId as PaidPlanId,
            cycle,
            redirectUrl,
        })
        return NextResponse.json({ url })
    } catch (err) {
        console.error("[lemonsqueezy] checkout failed", err)
        return NextResponse.json(
            { error: "Could not start the payment. Try again." },
            { status: 502 }
        )
    }
}

/** Whether the card button should be offered at all, for a given plan and cycle. */
export async function GET(req: Request) {
    const params = new URL(req.url).searchParams
    const planId = params.get("plan") as PlanId | null
    const cycle = params.get("cycle") === "yearly" ? "yearly" : "monthly"

    if (!planId || !PAID_PLANS.includes(planId)) {
        return NextResponse.json({ available: false })
    }

    return NextResponse.json({ available: canCheckout(planId as PaidPlanId, cycle) })
}