import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";

// Gemini rewrites the whole document — measured about 6s,
// so the platform default is not enough.
export const maxDuration = 60;

const AI_SERVICE =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  try {
    const formData = await readFormData(req);
        if (!formData) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

    const response = await fetch(`${AI_SERVICE}/api/grammar`, {
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