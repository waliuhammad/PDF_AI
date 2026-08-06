import { NextRequest, NextResponse } from "next/server";
import { decryptPDF } from "@pdfsmaller/pdf-decrypt";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = formData.get("password") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    let decryptedBytes: Uint8Array;

    try {
      // Try decrypting with the library if it's encrypted
      decryptedBytes = await decryptPDF(pdfBytes, password || "");
    } catch (decryptErr: any) {
      // If the error says it's not encrypted, verify if pdf-lib can load it directly
      if (decryptErr.message?.includes("not encrypted") || decryptErr.message?.includes("Encrypt dictionary")) {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        decryptedBytes = await pdfDoc.save();
      } else {
        throw decryptErr;
      }
    }

    return new Response(decryptedBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}-unlocked.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF Decryption Error:", err);
    return NextResponse.json(
      { error: err.message?.includes("password") ? "Incorrect password. Please try again." : (err.message || "Failed to unlock PDF document.") },
      { status: 500 }
    );
  }
}