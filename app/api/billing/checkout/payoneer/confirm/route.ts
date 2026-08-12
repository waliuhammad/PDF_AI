import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminAuth, isAdminConfigured, SESSION_COOKIE } from "@/lib/firebase/admin"
import { confirmPayment, rejectPayment } from "@/lib/billing/payoneer"

export const runtime = "nodejs"

/**
 * Grants a paid plan. Gated on a custom claim, not on a path in proxy.ts,
 * because the proxy is a redirect and not a security boundary.
 *
 * Set the claim once: setCustomUserClaims(uid, { admin: true })
 * The user must sign out and back in for it to reach the session cookie.
 */
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
        return NextResponse.json({ error: "Not authorized." }, { status: 401 })
    }

    let adminUid: string
    try {
        const decoded = await getAdminAuth().verifySessionCookie(session, true)
        if (decoded.admin !== true) {
            return NextResponse.json({ error: "Not authorized." }, { status: 403 })
        }
        adminUid = decoded.uid
    } catch {
        return NextResponse.json({ error: "Not authorized." }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const paymentId = body?.paymentId as string
    if (!paymentId) {
        return NextResponse.json({ error: "Missing payment id." }, { status: 400 })
    }

    try {
        if (body?.action === "reject") {
            await rejectPayment(paymentId, adminUid, (body?.note as string) ?? "")
        } else {
            await confirmPayment(paymentId, adminUid)
        }
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error("[payoneer] confirm failed", err)
        const message = err instanceof Error ? err.message : "Could not update this payment."
        return NextResponse.json({ error: message }, { status: 400 })
    }
}