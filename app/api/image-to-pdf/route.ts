import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

// Set worker source to CDN to run PDF rendering in browser context safely
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}

export async function convertPdfToImages(
  file: File,
  mode: "all" | "custom",
  pageNumber: number = 1,
  format: "png" | "jpeg" = "png"
): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not initialize canvas context.");

  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const ext = format === "jpeg" ? "jpg" : "png";

  if (mode === "custom") {
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error("Selected page number is out of bounds.");
    }

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.0 });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to export image blob."));
      }, mimeType);
    });

    return {
      blob,
      filename: `page_${pageNumber}.${ext}`,
    };
  } else {
    const zip = new JSZip();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL(mimeType);
      const base64Data = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
      zip.file(`page_${i}.${ext}`, base64Data, { base64: true });
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return {
      blob: zipBlob,
      filename: "converted_images.zip",
    };
  }
}