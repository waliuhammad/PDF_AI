import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminAuth, isAdminConfigured, SESSION_COOKIE } from "@/lib/firebase/admin"
import { createPayment, pendingPaymentFor } from "@/lib/billing/payoneer"
import type { PlanId, BillingCycle } from "@/lib/plans"

// firebase-admin needs Node, not Edge — same reason proxy.ts runs on Node.
export const runtime = "nodejs"

const PAID_PLANS: PlanId[] = ["pro", "business"]

export async function POST(req: Request) {
    // Without credentials getAdminApp() throws, which would surface as a
    // 500 on a route whose real answer is "not configured".
    if (!isAdminConfigured()) {
        return NextResponse.json({ error: "Payments are not available right now." }, { status: 503 })
    }

    const cookieStore = await cookies()
    // The session cookie is "pdfai_session"; reading "session" always found
    // nothing, so every request here answered 401 however the user signed in.
    const session = cookieStore.get(SESSION_COOKIE)?.value
    if (!session) {
        return NextResponse.json({ error: "Sign in to continue." }, { status: 401 })
    }

    let uid: string
    let email: string | null
    try {
        // checkRevoked so a signed-out-everywhere session cannot still buy
        const decoded = await getAdminAuth().verifySessionCookie(session, true)
        uid = decoded.uid
        email = decoded.email ?? null
    } catch {
        return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const planId = body?.planId as PlanId
    const cycle = body?.cycle as BillingCycle

    // Validate against plans.ts — never trust a price sent from the client.
    if (!PAID_PLANS.includes(planId)) {
        return NextResponse.json({ error: "Choose a paid plan." }, { status: 400 })
    }
    if (cycle !== "monthly" && cycle !== "yearly") {
        return NextResponse.json({ error: "Choose monthly or yearly billing." }, { status: 400 })
    }

    // Checked before an invoice is written: without it the response carried
    // payUrl: undefined and the button opened "undefined" as a URL, leaving a
    // pending payment behind with no way for the user to pay it.
    const payUrl = process.env.PAYONEER_PAYMENT_URL
    if (!payUrl) {
        console.error("[payoneer] PAYONEER_PAYMENT_URL is not set")
        return NextResponse.json(
            { error: "Payments are not available right now. Please try again later." },
            { status: 503 }
        )
    }

    try {
        const payment = await createPayment({ uid, email, planId, cycle })
        return NextResponse.json({ ...payment, payUrl })
    } catch (err) {
        console.error("[payoneer] create failed", err)
        return NextResponse.json({ error: "Could not start this payment. Try again." }, { status: 500 })
    }
}

/**
 * The caller's outstanding invoice.
 *
 * The reference code lived only in component state, so a reload lost it and
 * the customer had no way back to the code their payment has to quote — while
 * createPayment kept returning the same invoice, leaving them stuck.
 */
export async function GET() {
    if (!isAdminConfigured()) {
        return NextResponse.json({ payment: null })
    }

    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE)?.value
    if (!session) return NextResponse.json({ payment: null })

    try {
        const decoded = await getAdminAuth().verifySessionCookie(session, true)
        const payment = await pendingPaymentFor(decoded.uid)
        return NextResponse.json({
            payment: payment && { ...payment, payUrl: process.env.PAYONEER_PAYMENT_URL ?? null },
        })
    } catch {
        // Signed out or expired: nothing to restore, which is not an error.
        return NextResponse.json({ payment: null })
    }
}
