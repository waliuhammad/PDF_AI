import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const startRow = formData.get("startRow") || "1";
    const maxRows = formData.get("maxRows") || "60";
    const startCol = formData.get("startCol") || "1";
    const maxCols = formData.get("maxCols") || "70";

    if (!file) {
      return NextResponse.json({ error: "No spreadsheet file uploaded." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      range: { startRow, maxRows, startCol, maxCols },
      message: "Spreadsheet range parameters successfully handled on server endpoint.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}