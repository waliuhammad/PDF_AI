import { NextRequest, NextResponse } from "next/server";

// retrieval plus a Gemini answer,
// so the platform default is not enough.
export const maxDuration = 60;

const AI_SERVICE =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  try {
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