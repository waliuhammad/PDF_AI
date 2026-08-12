import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getFirestore } from "firebase-admin/firestore"
import {
    getAdminApp,
    getAdminAuth,
    isAdminConfigured,
    SESSION_COOKIE,
} from "@/lib/firebase/admin"

export const runtime = "nodejs"

/**
 * Every invoice awaiting confirmation, for the admin review screen.
 *
 * Admin-only, gated on the custom claim rather than on a path in proxy.ts,
 * since that proxy is a redirect and not a security boundary — the same rule
 * the confirm route follows.
 */
export async function GET() {
    // admin.ts exports no `firebaseAdmin`; callers open Firestore from the app,
    // and doing it inside the handler keeps a build from initialising Firebase
    // just by importing this module.
    if (!isAdminConfigured()) {
        return NextResponse.json({ error: "Not authorized." }, { status: 401 })
    }

    const session = (await cookies()).get(SESSION_COOKIE)?.value
    if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 })

    try {
        const decoded = await getAdminAuth().verifySessionCookie(session, true)
        if (decoded.admin !== true) {
            return NextResponse.json({ error: "Not authorized." }, { status: 403 })
        }
    } catch {
        return NextResponse.json({ error: "Not authorized." }, { status: 401 })
    }

    const db = getFirestore(getAdminApp())

    const snap = await db
        .collection("payments")
        .where("status", "==", "pending")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get()

    return NextResponse.json({
        payments: snap.docs.map((d) => {
            const data = d.data()
            return {
                id: d.id,
                ...data,
                // Firestore Timestamp is not JSON-serialisable.
                createdAt: data.createdAt?.toMillis() ?? null,
            }
        }),
    })
}
