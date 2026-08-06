import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

/**
 * Turns one or more images into a single PDF, one image per page.
 *
 * This file previously exported getPdfPageCount and convertPdfToImages —
 * browser helpers that used `document`, converted the opposite direction to
 * the route's name, and gave Next no handler to call, so the build rejected
 * the module. Rewritten as a real POST handler that runs on the server.
 */

const PAGE_SIZES = {
    a4: [595.28, 841.89],
    letter: [612, 792],
} as const;

/**
 * pdf-lib can only embed JPEG and PNG. Anything else has to be reported rather
 * than silently dropped, or the user gets a PDF missing pages.
 *
 * Decided from the bytes, not from file.type: that header is whatever the
 * client claimed, it is empty for uploads from tools that do not set it, and a
 * renamed file lies about it. A valid PNG was being turned away for having no
 * Content-Type.
 */
function sniff(bytes: Uint8Array): "png" | "jpeg" | null {
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const files = formData
            .getAll("files")
            .concat(formData.getAll("file"))
            .filter((entry): entry is File => entry instanceof File && entry.size > 0);

        if (files.length === 0) {
            return NextResponse.json({ error: "No images uploaded." }, { status: 400 });
        }

        // Read every file once, up front, so an unsupported one is caught
        // before any of the PDF is built.
        const loaded = await Promise.all(
            files.map(async (file) => {
                const bytes = new Uint8Array(await file.arrayBuffer());
                return { file, bytes, kind: sniff(bytes) };
            })
        );

        const unsupported = loaded.filter((item) => item.kind === null);
        if (unsupported.length > 0) {
            return NextResponse.json(
                {
                    error: `Only JPEG and PNG images can be converted. Unsupported: ${unsupported
                        .map((item) => item.file.name)
                        .join(", ")}`,
                },
                { status: 415 }
            );
        }

        const pageSize = (formData.get("pageSize") as string) || "a4";
        const orientation = (formData.get("orientation") as string) || "portrait";
        const margin = Number(formData.get("margin") ?? 36);

        const pdfDoc = await PDFDocument.create();

        for (const { bytes, kind } of loaded) {
            const image =
                kind === "png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

            if (pageSize === "fit") {
                // One page exactly the size of the image — no letterboxing.
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
                continue;
            }

            const [shortSide, longSide] = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES] ?? PAGE_SIZES.a4;
            const [pageWidth, pageHeight] =
                orientation === "landscape" ? [longSide, shortSide] : [shortSide, longSide];

            const page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Scale to fit inside the margins without distorting the aspect
            // ratio, then centre what's left over.
            const usableWidth = Math.max(pageWidth - margin * 2, 1);
            const usableHeight = Math.max(pageHeight - margin * 2, 1);
            const scale = Math.min(usableWidth / image.width, usableHeight / image.height, 1);

            const drawWidth = image.width * scale;
            const drawHeight = image.height * scale;

            page.drawImage(image, {
                x: (pageWidth - drawWidth) / 2,
                y: (pageHeight - drawHeight) / 2,
                width: drawWidth,
                height: drawHeight,
            });
        }

        const pdfBytes = await pdfDoc.save();

        return new Response(pdfBytes as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="images.pdf"',
            },
        });
    } catch (err) {
        console.error("Image to PDF error:", err);
        const message = err instanceof Error ? err.message : "Failed to build the PDF.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
