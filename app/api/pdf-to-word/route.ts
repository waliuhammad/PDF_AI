import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.CONVERTAPI_SECRET;

  // Not a server fault and not the visitor's problem to decode — a missing key
  // means the tool is switched off, so say that and log the real reason.
  if (!secret || secret === "YOUR_ACTUAL_SECRET_HERE") {
    console.error(
      "pdf-to-word: CONVERTAPI_SECRET is not set, so Word conversion is unavailable."
    );
    return NextResponse.json(
      { error: "Word conversion is not available right now. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = buffer.toString("base64");

    const apiRes = await fetch(
      "https://v2.convertapi.com/convert/pdf/to/docx",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Parameters: [
            {
              Name: "File",
              FileValue: {
                Name: file.name,
                Data: base64File,
              },
            },
            {
              Name: "StoreFile",
              Value: true,
            },
          ],
        }),
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
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${file.name.replace(
          /\.[^/.]+$/,
          ""
        )}_converted.docx"`,
      },
    });
  } catch (error: any) {
    console.error("PDF to Word conversion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert PDF file to Word." },
      { status: 500 }
    );
  }
}