import { NextRequest, NextResponse } from "next/server";
import { readDevPlanFromRequest } from "@/lib/dev-plan";
import { getRequestUid } from "@/lib/server-auth";
import { peekUsage } from "@/lib/usage";

/**
 * Reports the signed-in user's tool usage for today without consuming any:
 * { used, limit, plan }. The dashboard and tool pages read this to show
 * "X of Y operations used today" and to explain a 429 before it happens.
 */
export async function GET(req: NextRequest) {
    const uid = await getRequestUid(req);
    if (!uid) {
        return NextResponse.json(
            { success: false, message: "Not signed in." },
            { status: 401 }
        );
    }

    // The metered tool routes honour the dev plan toggle through
    // requireUsageAllowance, but this one did not, so the meter always
    // reported the Firestore profile's plan and its limit. Switching the
    // tester to pro or business changed what the tools enforced while the
    // card still read "free plan".
    const devPlan = readDevPlanFromRequest(req);
    const usage = await peekUsage(uid, devPlan ?? undefined);

    return NextResponse.json({
        success: true,
        used: usage.used,
        limit: usage.limit,
        plan: usage.plan,
    });
}