import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import { decryptPDF } from "@pdfsmaller/pdf-decrypt";
import { PDFDocument } from "pdf-lib";
import { errorMessage } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const formData = await readFormData(req);
        if (!formData) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
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
    } catch (decryptErr) {
      // If the error says it's not encrypted, verify if pdf-lib can load it directly
      const decryptMessage = errorMessage(decryptErr, "");
      if (decryptMessage.includes("not encrypted") || decryptMessage.includes("Encrypt dictionary")) {
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
  } catch (err) {
    // The detail stays in the server log. It was being returned to the browser,
    // which meant a file that is not a PDF answered with the decrypt library's
    // internal parser position — "line:0 col:82 offset=41: No PDF header found"
    // — which tells the visitor nothing and describes our dependencies.
    console.error("PDF Decryption Error:", err);

    const detail = errorMessage(err, "").toLowerCase();

    // Structure first. The library wraps everything as "Failed to decrypt
    // PDF: ...", so a file that is not a PDF at all still carries the word
    // decrypt and would otherwise be reported as a wrong password.
    if (detail.includes("pdf header") || detail.includes("parse") || detail.includes("invalid pdf")) {
      return NextResponse.json(
        { error: "That file could not be read as a PDF." },
        { status: 400 }
      );
    }

    // A wrong password is the visitor's input, not a fault on this server, so
    // this was answering 500 for the single most likely outcome of using the
    // tool.
    if (detail.includes("password") || detail.includes("decrypt")) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to unlock PDF document." },
      { status: 500 }
    );
  }
}