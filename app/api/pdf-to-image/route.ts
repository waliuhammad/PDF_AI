import { NextResponse } from "next/server";
import { pdfToPng } from "pdf-to-png-converter";
import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";

// renders every page to a bitmap,
// so the platform default is not enough.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const action = formData.get("action");
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save temporary file safely in OS tmp dir
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-"));
    const tempFilePath = path.join(tempDir, file.name);
    fs.writeFileSync(tempFilePath, buffer);

    if (action === "get-info") {
      const pages = await pdfToPng(tempFilePath, {
        returnMetadataOnly: true,
      });
      
      fs.rmSync(tempDir, { recursive: true, force: true });
      return NextResponse.json({ numPages: pages.length });
    }

    if (action === "convert") {
      const mode = formData.get("mode");
      const pageNumberStr = formData.get("pageNumber") as string;
      
      let options: any = {
        outputFolder: tempDir,
        viewportScale: 2.0,
      };

      if (mode === "custom") {
        const pageNum = parseInt(pageNumberStr, 10);
        options.pagesToProcess = [pageNum];
      }

      const pngPages = await pdfToPng(tempFilePath, options);

      if (mode === "custom" && pngPages.length > 0) {
        const singlePage = pngPages[0];
        if (singlePage.kind === "content" && singlePage.content) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          return new NextResponse(singlePage.content as unknown as BodyInit, {
            headers: {
              "Content-Type": "image/png",
              "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}_page_${pageNumberStr}.png"`,
            },
          });
        }
      }

      const zip = new AdmZip();
      pngPages.forEach((page) => {
        if (page.kind === "content" && page.content) {
          zip.addFile(page.name, page.content);
        } else if (page.kind === "file" && page.path) {
          zip.addLocalFile(page.path);
        }
      });

      const zipBuffer = zip.toBuffer();
      fs.rmSync(tempDir, { recursive: true, force: true });

      return new NextResponse(zipBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}_images.zip"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("PDF conversion error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}