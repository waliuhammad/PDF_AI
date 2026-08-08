import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import {} from "pdf-lib";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt-lite";
import {} from "@/lib/errors";

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

    if (!password || password.trim().length === 0) {
      return NextResponse.json({ error: "Password is required for protection." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    // Encrypt the PDF securely with the user password
    const encryptedBytes = await encryptPDF(pdfBytes, password);

    return new Response(encryptedBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}-protected.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF Encryption Error:", err);
    return NextResponse.json({ error: "Failed to protect PDF document." }, { status: 500 });
  }
}