import "server-only"
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore"
import { getAdminApp } from "@/lib/firebase/admin"
import { getPlan, type PlanId, type BillingCycle } from "@/lib/plans"

/**
 * admin.ts exports no `db`; it hands out the app and each caller opens
 * Firestore from it, which is what lib/usage.ts does. Resolved on call rather
 * than at import so loading this module cannot initialise Firebase as a side
 * effect of a build.
 */
function database(): Firestore {
    return getFirestore(getAdminApp())
}

export type PaymentStatus = "pending" | "paid" | "rejected" | "expired"

function makeReference(): string {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
    let out = ""
    for (let i = 0; i < 8; i++) {
        out += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return `PDFAI-${out}`
}

export function priceFor(planId: PlanId, cycle: BillingCycle): number {
    const plan = getPlan(planId)
    // yearly price is stored per-month, so bill 12x for a one-time invoice
    return cycle === "yearly" ? plan.yearlyPrice * 12 : plan.monthlyPrice
}

export async function createPayment(args: {
    uid: string
    email: string | null
    planId: PlanId
    cycle: BillingCycle
}): Promise<{ id: string; reference: string; amount: number }> {
    if (args.planId === "free") throw new Error("cannot invoice the free plan")

    // Reuse any pending invoice — a double-click otherwise means the user
    // pays twice and you owe a refund you cannot automate.
    const existing = await database()
        .collection("payments")
        .where("uid", "==", args.uid)
        .where("status", "==", "pending")
        .limit(1)
        .get()

    if (!existing.empty) {
        const doc = existing.docs[0]
        const data = doc.data()
        return {
            id: doc.id,
            reference: data.reference as string,
            amount: data.amount as number,
        }
    }

    const reference = makeReference()
    const amount = priceFor(args.planId, args.cycle)
    const ref = database().collection("payments").doc()

    await ref.set({
        uid: args.uid,
        email: args.email,
        planId: args.planId,
        cycle: args.cycle,
        amount,
        currency: "USD",
        status: "pending",
        provider: "payoneer",
        reference,
        createdAt: FieldValue.serverTimestamp(),
    })

    return { id: ref.id, reference, amount }
}

/** Admin-only. Transaction so a double-confirm cannot stack two periods on one payment. */
export async function confirmPayment(paymentId: string, adminUid: string): Promise<void> {
    const store = database()
    const paymentRef = store.collection("payments").doc(paymentId)

    await store.runTransaction(async (tx) => {
        const snap = await tx.get(paymentRef)
        if (!snap.exists) throw new Error("payment not found")

        const payment = snap.data()!
        if (payment.status !== "pending") {
            throw new Error(`payment already ${payment.status}`)
        }

        const subRef = store.collection("subscriptions").doc(payment.uid as string)
        const subSnap = await tx.get(subRef)
        const currentEnd = (subSnap.data()?.currentPeriodEnd as number) ?? 0

        const now = Date.now()
        const periodMs = payment.cycle === "yearly" ? 365 * 864e5 : 30 * 864e5
        // Extend from existing expiry so an early renewal never shortens the plan.
        const start = currentEnd > now ? currentEnd : now

        tx.set(
            subRef,
            {
                provider: "payoneer",
                planId: payment.planId,
                status: "active",
                cycle: payment.cycle,
                currentPeriodEnd: start + periodMs,
                autoRenew: false,
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        )

        tx.update(paymentRef, {
            status: "paid",
            confirmedAt: FieldValue.serverTimestamp(),
            confirmedBy: adminUid,
        })
    })
}

export async function rejectPayment(
    paymentId: string,
    adminUid: string,
    note: string
): Promise<void> {
    await database().collection("payments").doc(paymentId).update({
        status: "rejected",
        confirmedAt: FieldValue.serverTimestamp(),
        confirmedBy: adminUid,
        note,
    })
}