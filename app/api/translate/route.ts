import { getAppConfig } from "@/lib/remote-config";
import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";

// Gemini translates the whole document — measured about 8s,
// so the platform default is not enough.
export const maxDuration = 60;

const AI_SERVICE =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  try {
    // Remote Config kill-switch: lets the AI features be disabled from the
    // Firebase Console (parameter: ai_tools_enabled) without a redeploy.
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

    const formData = await readFormData(req);
    if (!formData) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const response = await fetch(`${AI_SERVICE}/api/translate`, {
      method: "POST",
      body: formData,
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