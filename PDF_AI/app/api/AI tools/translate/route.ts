import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  try {
    // Use req.formData() instead of req.json() to handle file uploads
    const formData = await req.formData();

    const response = await fetch(`${AI_SERVICE_URL}/api/translate`, {
      method: "POST",
      body: formData, 
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

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