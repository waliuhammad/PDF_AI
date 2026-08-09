import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured, SESSION_COOKIE } from "@/lib/firebase/admin";
import { billingConfigProblem, createCheckout, variantFor } from "@/lib/billing/lemonsqueezy";
import type { BillingCycle, PlanId } from "@/lib/plans";

/**
 * Creates a Lemon Squeezy checkout for the signed-in user.
 *
 * Identity comes from the verified session cookie, never the request body:
 * the uid embedded in the checkout decides whose plan the webhook upgrades,
 * so letting the browser name a uid would let anyone buy upgrades for
 * arbitrary accounts (or worse, claim them without paying).
 */

const PAID_PLANS: PlanId[] = ["pro", "business"];
const CYCLES: BillingCycle[] = ["monthly", "yearly"];

export async function POST(req: NextRequest) {
    try {
        // Who is buying?
        const session = req.cookies.get(SESSION_COOKIE)?.value;
        if (!session || !isAdminConfigured()) {
            return NextResponse.json(
                { success: false, message: "Please sign in to upgrade." },
                { status: 401 }
            );
        }

        let uid: string;
        let email: string | undefined;
        try {
            const decoded = await getAdminAuth().verifySessionCookie(session, true);
            uid = decoded.uid;
            email = decoded.email;
        } catch {
            return NextResponse.json(
                { success: false, message: "Your session has expired — please sign in again." },
                { status: 401 }
            );
        }

        // What are they buying?
        const body = await req.json().catch(() => null);
        const planId = body?.planId as PlanId;
        const billing = body?.billing as BillingCycle;

        if (!PAID_PLANS.includes(planId) || !CYCLES.includes(billing)) {
            return NextResponse.json(
                { success: false, message: "Unknown plan or billing cycle." },
                { status: 400 }
            );
        }

        const configProblem = billingConfigProblem();
        const variantId = variantFor(planId, billing);
        if (configProblem || !variantId) {
            console.error(
                "Billing not configured:",
                configProblem ?? `variant for ${planId}-${billing} not set`
            );
            return NextResponse.json(
                { success: false, message: "Checkout isn't available right now. Please try again later." },
                { status: 503 }
            );
        }

        // Where do they land after paying?
        const origin = req.nextUrl.origin;
        const url = await createCheckout({
            variantId,
            email: email ?? "",
            userId: uid,
            planId,
            redirectUrl: `${origin}/settings?upgraded=1`,
        });

        return NextResponse.json({ success: true, url });
    } catch (err) {
        console.error("Checkout error:", err);
        return NextResponse.json(
            { success: false, message: "Could not start checkout. Please try again." },
            { status: 500 }
        );
    }
}