import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getRequestUid } from "@/lib/server-auth";
import { checkAndCountUsage } from "@/lib/usage";

/**
 * The shared gate for every metered tool route.
 *
 * Returns null when the request may proceed, or a ready-made refusal
 * response (401 signed out / 429 allowance exhausted). One call at the
 * top of a route replaces the blocks that would otherwise be repeated
 * across twenty files. The limit itself (2/20/50) comes from the user's
 * plan and the client's Remote Config, inside checkAndCountUsage.
 */
export async function requireUsageAllowance(
    req: NextRequest
): Promise<NextResponse | null> {
    const uid = await getRequestUid(req);
    if (!uid) {
        return NextResponse.json(
            {
                success: false,
                error: "Please sign in to use the tools.",
                message: "Please sign in to use the tools.",
            },
            { status: 401 }
        );
    }

    const usage = await checkAndCountUsage(uid);
    if (!usage.allowed) {
        const message = `Daily limit reached (${usage.used}/${usage.limit} operations on the ${usage.plan} plan). Upgrade for a higher daily allowance, or come back tomorrow.`;
        return NextResponse.json(
            { success: false, error: message, message },
            { status: 429 }
        );
    }

    return null;
}