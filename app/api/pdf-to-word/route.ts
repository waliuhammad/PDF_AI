import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret =  process.env.CONVERTAPI_SECRET;

  console.log("CHECKING SECRET KEY:", secret ? "Key exists!" : "KEY IS UNDEFINED!");

  try {
    if (!secret || secret === "YOUR_ACTUAL_SECRET_HERE") {
      return NextResponse.json(
        { error: "Missing valid CONVERTAPI_SECRET in environment variables." },
        { status: 500 }
      );
    }
   
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const convertFormData = new FormData();
    const blob = new Blob([buffer], { type: "application/pdf" });
    convertFormData.append("File", blob, file.name);
    convertFormData.append("StoreFile", "true");

    // Pass secret directly as a query parameter to guarantee authorization
    const apiRes = await fetch(
      `https://v2.convertapi.com/convert/pdf/to/docx?secret=${encodeURIComponent(secret)}`,
      {
        method: "POST",
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
    const docxBuffer = await downloadRes.arrayBuffer();

    return new NextResponse(Buffer.from(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}_converted.docx"`,
      },
    });
  } catch (error: any) {
    console.error("PDF to Word conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert PDF file to Word." },
      { status: 500 }
    );
  }
}