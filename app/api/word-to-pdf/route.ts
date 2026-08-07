import { NextRequest, NextResponse } from "next/server";
import { docxToPdf } from "@/lib/docx-to-pdf";

export const runtime = "nodejs";

// Reading and re-laying out a long document is not instant.
export const maxDuration = 60;

/**
 * Converts here rather than posting the document to ConvertAPI.
 *
 * This route required CONVERTAPI_SECRET and answered 503 without it, so the
 * tool did nothing at all. It also meant every uploaded document was sent to a
 * third party. A .docx is a zip of XML, so it does not have to leave.
 */
export async function POST(req: NextRequest) {
    try {
        // formData() throws outright on a request with no multipart body, so a
        // missing file has to be caught here or it surfaces as a 500.
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ error: "No Word file provided." }, { status: 400 });
        }

        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No Word file provided." }, { status: 400 });
        }

        const name = file.name.toLowerCase();
        if (!name.endsWith(".docx")) {
            // .doc is the old binary format — a different problem entirely.
            return NextResponse.json(
                {
                    error: name.endsWith(".doc")
                        ? "Only .docx is supported. Open the file in Word and save it as .docx."
                        : "That file is not a Word document.",
                },
                { status: 415 }
            );
        }

        let pdf: Uint8Array;
        try {
            pdf = await docxToPdf(new Uint8Array(await file.arrayBuffer()));
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : "Could not read that document." },
                { status: 400 }
            );
        }

        const base = file.name.replace(/\.[^/.]+$/, "") || "document";

        return new NextResponse(Buffer.from(pdf), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${base}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Word to PDF error:", error);
        return NextResponse.json(
            { error: "Failed to convert the document." },
            { status: 500 }
        );
    }
}
