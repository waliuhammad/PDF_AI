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
    const rotation = (formData.get("rotation") as string) || "90";
    const mode = (formData.get("mode") as string) || "all";
    const pageNumber = (formData.get("pageNumber") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const convertFormData = new FormData();
    const blob = new Blob([buffer], { type: "application/pdf" });
    convertFormData.append("File", blob, file.name);
    
    // Normalize 360 degree rotation to 0 (full circle) or pass direct rotation value
    const effectiveRotation = rotation === "360" ? "0" : rotation;
    convertFormData.append("RotatePage", effectiveRotation);

    // Apply specific page targeting if custom mode is chosen
    if (mode === "custom" && pageNumber.trim() !== "") {
      convertFormData.append("PageRange", pageNumber.trim());
    }

    convertFormData.append("StoreFile", "true");

    const apiRes = await fetch(
      "https://v2.convertapi.com/convert/pdf/to/rotate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        body: convertFormData,
      }
    );

    if (!apiRes.ok) {
      let errText = "";
      try {
        errText = await apiRes.text();
      } catch {}
      console.error("ConvertAPI error response details:", errText);
      return NextResponse.json(
        { error: `Conversion service rejected the request: ${errText || apiRes.statusText}` },
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
    if (!downloadRes.ok) {
      return NextResponse.json(
        { error: "Failed to download processed document from storage." },
        { status: 500 }
      );
    }

    const pdfBuffer = await downloadRes.arrayBuffer();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}_rotated.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Rotate PDF error:", error);
    return NextResponse.json(
      { error: "Failed to rotate PDF file due to an internal server error." },
      { status: 500 }
    );
  }
}