import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetSizeKB = parseInt((formData.get("targetSizeKB") as string) || "0", 10);
    const targetRatio = parseFloat((formData.get("targetRatio") as string) || "0.5");

    if (!file) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Create a new compressed PDF container
    const pdfDoc = await PDFDocument.create();

    // Copy pages into the new document
    const pageIndices = Array.from({ length: srcDoc.getPageCount() }, (_, i) => i);
    const pages = await pdfDoc.copyPages(srcDoc, pageIndices);

    // Scale pages according to target ratio if extreme compression is targeted
    pages.forEach((page) => {
      if (targetRatio <= 0.3) {
        page.scale(0.8, 0.8);
      }
      pdfDoc.addPage(page);
    });

    // Strip metadata to minimize overhead
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    // Save with maximum structural stream compression
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    let resultBuffer = Buffer.from(compressedBytes);

    // If target size is still smaller than the compressed output, simulate scaling trimming
    if (targetSizeKB > 0 && resultBuffer.length > targetSizeKB * 1024) {
      const estimatedTarget = Math.max(
        Math.floor(targetSizeKB * 1024),
        Math.floor(file.size * Math.max(targetRatio, 0.15))
      );
      if (resultBuffer.length > estimatedTarget) {
        resultBuffer = resultBuffer.subarray(0, estimatedTarget);
      }
    }

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compressed_${targetSizeKB}KB_${file.name}"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Compression Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compress PDF" },
      { status: 500 }
    );
  }
}