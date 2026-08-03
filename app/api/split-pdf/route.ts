import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const splitMode = formData.get("splitMode") as string;
    const fromPage = parseInt((formData.get("fromPage") as string) || "1", 10);
    const toPage = parseInt((formData.get("toPage") as string) || "1", 10);
    const everyN = parseInt((formData.get("everyN") as string) || "1", 10);
    const downloadChoice = formData.get("downloadChoice") as string;

    if (!file) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = srcDoc.getPageCount();
    const newDoc = await PDFDocument.create();

    const targetIndices: number[] = [];

    if (splitMode === "range") {
      const start = Math.max(0, fromPage - 1);
      const end = Math.min(totalPages - 1, toPage - 1);

      if (downloadChoice === "split") {
        for (let i = start; i <= end; i++) {
          targetIndices.push(i);
        }
      } else {
        // Remaining pages
        for (let i = 0; i < totalPages; i++) {
          if (i < start || i > end) {
            targetIndices.push(i);
          }
        }
      }
    } else if (splitMode === "every") {
      const chunkSize = Math.max(1, everyN);
      const end = Math.min(totalPages, chunkSize);
      for (let i = 0; i < end; i++) {
        targetIndices.push(i);
      }
    }

    if (targetIndices.length === 0) {
      return NextResponse.json(
        { error: "No remaining pages left to extract. Select a smaller range." },
        { status: 400 }
      );
    }

    const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="split-document.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF Split Error:", error);
    return NextResponse.json({ error: error.message || "Failed to split PDF" }, { status: 500 });
  }
}