import { getAppConfig } from "@/lib/remote-config";
import { getRequestUid } from "@/lib/server-auth";
import { checkAndCountUsage } from "@/lib/usage";
import { NextRequest, NextResponse } from "next/server";

// retrieval plus a Gemini answer,
// so the platform default is not enough.
export const maxDuration = 60;

const AI_SERVICE =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  try {
    // Remote Config kill-switch: lets the AI features be disabled from the
    // Firebase Console (parameter: ai_tools_enabled) without a redeploy —
    // for example when the Gemini quota is exhausted.
    const { aiToolsEnabled } = await getAppConfig();
    if (!aiToolsEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "AI features are temporarily disabled. Please try again later.",
        },
        { status: 503 }
      );
    }

    // AI features are metered per user, so they require a signed-in user:
    // an anonymous visitor has no identity to count against.
    const uid = await getRequestUid(req);
    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          message: "Please sign in to use AI features.",
        },
        { status: 401 }
      );
    }

    // Count this operation against today's plan allowance (limits come
    // from the client's Remote Config: free 2/day, pro 20, business 50).
    const usage = await checkAndCountUsage(uid);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Daily limit reached (${usage.used}/${usage.limit} operations on the ${usage.plan} plan). Upgrade for a higher daily allowance, or come back tomorrow.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    const response = await fetch(`${AI_SERVICE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to AI Service.",
      },
      {
        status: 500,
      }
    );
  }
}