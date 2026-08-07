import { NextRequest, NextResponse } from "next/server";

// parse, chunk, embed and store the document,
// so the platform default is not enough.
export const maxDuration = 60;

const AI_SERVICE =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await fetch(`${AI_SERVICE}/api/chat/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
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