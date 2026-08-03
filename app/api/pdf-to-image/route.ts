import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string;
    const pageNumber = formData.get("pageNumber") as string;
    const imageFormat = formData.get("imageFormat") as string;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    if (mode === "custom" && !pageNumber) {
      return NextResponse.json({ error: "Target page number is required for custom mode." }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed image conversion request for mode: ${mode}, format: ${imageFormat || 'image/png'}` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}