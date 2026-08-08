import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { errorMessage } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const formData = await readFormData(req);
        if (!formData) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
    const file = formData.get("file") as File | null;
    const signMode = formData.get("signMode") as string;
    const signatureText = formData.get("signatureText") as string | null;
    const signatureImage = formData.get("signatureImage") as string | null;
    const targetPageNum = parseInt(formData.get("pageNumber") as string) || 1;
    const position = formData.get("position") as string || "right";
    const signScope = formData.get("signScope") as string || "specific"; // "specific" or "all"

    if (!file) {
      return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfDoc = await PDFDocument.load(buffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const signY = 40;
    const margin = 50;

    let embeddedImage = null;
    if (signMode === "draw" && signatureImage) {
      const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
      const imageBytes = Buffer.from(base64Data, "base64");
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    }

    const text = signatureText ? signatureText.substring(0, 35) : "Authorized Signature";
    const fontSize = 14;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const imgWidth = 150;
    const imgHeight = 50;

    const pagesToSign = signScope === "all" ? pages : [pages[Math.max(0, Math.min(targetPageNum - 1, pages.length - 1))]];

    for (const targetPage of pagesToSign) {
      const { width } = targetPage.getSize();
      let signX = margin;

      if (signMode === "draw" && embeddedImage) {
        if (position === "center") {
          signX = (width - imgWidth) / 2;
        } else if (position === "right") {
          signX = width - imgWidth - margin;
        }

        targetPage.drawImage(embeddedImage, {
          x: signX,
          y: signY,
          width: imgWidth,
          height: imgHeight,
        });
      } else {
        if (position === "center") {
          signX = (width - textWidth) / 2;
        } else if (position === "right") {
          signX = width - textWidth - margin;
        }

        targetPage.drawText(text, {
          x: signX,
          y: signY + 15,
          size: fontSize,
          font,
          color: rgb(0.08, 0.15, 0.3),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}-signed.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF Signing Error:", err);
    return NextResponse.json({ error: errorMessage(err, "Failed to sign document.") }, { status: 500 });
  }
}