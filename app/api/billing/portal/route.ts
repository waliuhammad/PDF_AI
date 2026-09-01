import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminAuth, isAdminConfigured, SESSION_COOKIE } from "@/lib/firebase/admin"
import {
    customerPortalUrl,
    isLemonSqueezyConfigured,
    subscriptionFor,
} from "@/lib/billing/lemonsqueezy"

export const runtime = "nodejs"

export async function POST() {
    if (!isAdminConfigured()) {
        return NextResponse.json(
            { message: "Subscription management is not available right now." },
            { status: 503 }
        )
    }

    const session = (await cookies()).get(SESSION_COOKIE)?.value
    if (!session) {
        return NextResponse.json({ message: "Sign in to continue." }, { status: 401 })
    }

    let uid: string
    try {
        const decoded = await getAdminAuth().verifySessionCookie(session, true)
        uid = decoded.uid
    } catch {
        return NextResponse.json({ message: "Your session expired. Sign in again." }, { status: 401 })
    }

    if (!isLemonSqueezyConfigured()) {
        return NextResponse.json(
            { message: "Subscription management is not connected yet." },
            { status: 503 }
        )
    }

    const sub = await subscriptionFor(uid)

    // Payoneer customers get an honest "there is nothing to manage" instead of a
    // dead end — those are one-off transfers with no card on file.
    if (!sub || sub.provider !== "lemonsqueezy" || !sub.subscriptionId) {
        return NextResponse.json(
            {
                message:
                    sub?.provider === "payoneer"
                        ? "Your plan was paid by bank transfer, so there is no subscription to manage. It ends on its own unless you renew."
                        : "You do not have a card subscription to manage.",
            },
            { status: 404 }
        )
    }

    try {
        const url = await customerPortalUrl(uid)
        if (!url) {
            return NextResponse.json(
                { message: "Lemon Squeezy did not return a portal link. Try again shortly." },
                { status: 502 }
            )
        }
        return NextResponse.json({ url })
    } catch (err) {
        console.error("[lemonsqueezy] portal lookup failed", err)
        return NextResponse.json(
            { message: "Could not open the billing portal. Try again shortly." },
            { status: 502 }
        )
    }
}