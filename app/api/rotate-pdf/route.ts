import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import { metered } from "@/lib/metered";
import { PDFDocument, degrees } from "pdf-lib";
import { rejectBadUpload, contentDisposition } from "@/lib/uploads";

/**
 * Rotation is a change to one number in each page's dictionary, so pdf-lib does
 * it here. This used to POST the document to ConvertAPI and download the result
 * back, which meant the tool was dead without a paid key and sent every
 * uploaded file to a third party to do arithmetic.
 */
export const POST = metered(async (req: NextRequest) => {
    try {
        // Every tool counts against the user's daily allowance (2/20/50 by
        // plan, from Remote Config) and therefore requires sign-in.

        const formData = await readFormData(req);
        if (!formData) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
        const file = formData.get("file") as File | null;
        const rotation = parseInt((formData.get("rotation") as string) || "90", 10);
        const mode = (formData.get("mode") as string) || "all";
        const pageNumber = ((formData.get("pageNumber") as string) || "").trim();
        // Per-page angles, sent by the preview when pages have been turned
        // individually: {"1": 90, "3": 270}. Takes precedence over mode and
        // rotation, which describe one angle for a whole set of pages and
        // cannot express a document where every page differs.
        const perPageRaw = (formData.get("rotations") as string) || "";

        if (!file) {
            return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
        }

        // Size and type are checked here, before anything reads the bytes.
        const badUpload = rejectBadUpload(file, "pdf");
        if (badUpload) return badUpload;

        let perPage: Record<string, number> | null = null;
        if (perPageRaw) {
            try {
                perPage = JSON.parse(perPageRaw) as Record<string, number>;
            } catch {
                return NextResponse.json(
                    { error: "Could not read the per-page rotations." },
                    { status: 400 }
                );
            }

            for (const [page, angle] of Object.entries(perPage)) {
                if (!Number.isInteger(angle) || angle % 90 !== 0) {
                    return NextResponse.json(
                        { error: `Rotation for page ${page} must be a multiple of 90 degrees.` },
                        { status: 400 }
                    );
                }
            }
        }

        // Only checked when it is the one being used: a request sending
        // per-page angles has no single rotation to validate, and rejecting it
        // on the default would refuse a perfectly good document.
        if (!perPage && (!Number.isFinite(rotation) || rotation % 90 !== 0)) {
            return NextResponse.json(
                { error: "Rotation must be a multiple of 90 degrees." },
                { status: 400 }
            );
        }

        let pdf: PDFDocument;
        try {
            pdf = await PDFDocument.load(await file.arrayBuffer());
        } catch {
            return NextResponse.json(
                { error: "That file could not be read as a PDF." },
                { status: 400 }
            );
        }

        const pages = pdf.getPages();

        if (perPage) {
            // Pages the reader never turned simply are not in the object, so
            // they keep whatever rotation they arrived with.
            for (const [page, angle] of Object.entries(perPage)) {
                const index = parseInt(page, 10) - 1;
                if (!Number.isInteger(index) || index < 0 || index >= pages.length) continue;
                if (angle === 0) continue;

                const current = pages[index].getRotation().angle;
                pages[index].setRotation(degrees(normalise(current + angle)));
            }

            return pdfResponse(pdf, file.name);
        }

        // "custom" takes a page list like "1, 3, 5-7".
        let targets: number[];
        if (mode === "custom" && pageNumber !== "") {
            targets = parsePageList(pageNumber, pages.length);
            if (targets.length === 0) {
                return NextResponse.json(
                    {
                        error: `No valid pages in "${pageNumber}". This PDF has ${pages.length} page${pages.length === 1 ? "" : "s"}.`,
                    },
                    { status: 400 }
                );
            }
        } else {
            targets = pages.map((_, i) => i);
        }

        for (const i of targets) {
            // Rotation is cumulative on whatever the page already carried.
            const current = pages[i].getRotation().angle;
            pages[i].setRotation(degrees(normalise(current + rotation)));
        }

        return pdfResponse(pdf, file.name);
    } catch (error) {
        console.error("Rotate PDF error:", error);
        return NextResponse.json(
            { error: "Failed to rotate PDF file due to an internal server error." },
            { status: 500 }
        );
    }
});

/** Saves the document and hands it back as a download. */
async function pdfResponse(pdf: PDFDocument, sourceName: string): Promise<NextResponse> {
    const bytes = await pdf.save();
    const base = sourceName.replace(/\.[^/.]+$/, "") || "document";

    return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": contentDisposition(`${base}_rotated.pdf`),
        },
    });
}

/** pdf-lib rejects negative angles, and 360 should mean "unchanged". */
function normalise(angle: number): number {
    return ((angle % 360) + 360) % 360;
}

/** "1, 3, 5-7" -> zero-based indexes, out-of-range entries dropped. */
function parsePageList(spec: string, total: number): number[] {
    const out = new Set<number>();

    for (const part of spec.split(",")) {
        const chunk = part.trim();
        if (!chunk) continue;

        const range = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
        if (range) {
            const from = parseInt(range[1], 10);
            const to = parseInt(range[2], 10);
            for (let p = Math.min(from, to); p <= Math.max(from, to); p++) {
                if (p >= 1 && p <= total) out.add(p - 1);
            }
            continue;
        }

        const single = parseInt(chunk, 10);
        if (Number.isFinite(single) && single >= 1 && single <= total) out.add(single - 1);
    }

    return [...out].sort((a, b) => a - b);
}