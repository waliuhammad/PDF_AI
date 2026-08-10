import { NextRequest, NextResponse } from "next/server";
import { getRequestUid } from "@/lib/server-auth";
import { peekUsage } from "@/lib/usage";

/**
 * Reports the signed-in user's AI usage for today without consuming any:
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

    const usage = await peekUsage(uid);

    return NextResponse.json({
        success: true,
        used: usage.used,
        limit: usage.limit,
        plan: usage.plan,
    });
}