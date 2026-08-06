import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const pageOrderJson = formData.get("pageOrder") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No PDF files provided." }, { status: 400 });
    }

    const mergedPdf = await PDFDocument.create();

    const fileMap = new Map<string, ArrayBuffer>();
    for (let i = 0; i < files.length; i++) {
      fileMap.set(i.toString(), await files[i].arrayBuffer());
    }

    if (pageOrderJson) {
      const pageOrder: { fileIndex: number; pageIndex: number; rotation?: number }[] = JSON.parse(pageOrderJson);
      const loadedPdfDocs = new Map<number, PDFDocument>();

      for (const item of pageOrder) {
        let pdfDoc = loadedPdfDocs.get(item.fileIndex);
        if (!pdfDoc) {
          const buffer = fileMap.get(item.fileIndex.toString());
          if (!buffer) continue;
          pdfDoc = await PDFDocument.load(buffer);
          loadedPdfDocs.set(item.fileIndex, pdfDoc);
        }

        const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [item.pageIndex]);

        if (item.rotation && item.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          let newAngle = (currentRotation + item.rotation) % 360;
          if (newAngle < 0) newAngle += 360;
          copiedPage.setRotation(degrees(newAngle));
        }

        mergedPdf.addPage(copiedPage);
      }
    } else {
      for (const [_, buffer] of fileMap) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
    }

    const mergedPdfBytes = await mergedPdf.save();

    return new NextResponse(Buffer.from(mergedPdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="merged_document.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Merge PDF error:", error);
    return NextResponse.json(
      { error: "Failed to merge PDF files. Please verify the uploaded documents." },
      { status: 500 }
    );
  }
}