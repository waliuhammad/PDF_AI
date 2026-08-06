import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CONVERTAPI_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Missing CONVERTAPI_SECRET in environment variables." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No Word file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const convertFormData = new FormData();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    convertFormData.append("File", blob, file.name);
    convertFormData.append("StoreFile", "true");

    const apiRes = await fetch(
      "https://v2.convertapi.com/convert/docx/to/pdf",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        body: convertFormData,
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("ConvertAPI error response details:", errText);
      return NextResponse.json(
        { error: `Conversion service rejected the request: ${errText}` },
        { status: 500 }
      );
    }

    const data = await apiRes.json();
    if (!data.Files || data.Files.length === 0) {
      return NextResponse.json(
        { error: "Conversion failed to generate output file." },
        { status: 500 }
      );
    }

    const fileUrl = data.Files[0].Url;
    const downloadRes = await fetch(fileUrl);
    const pdfBuffer = await downloadRes.arrayBuffer();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}_converted.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Word to PDF conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert Word file to PDF." },
      { status: 500 }
    );
  }
}