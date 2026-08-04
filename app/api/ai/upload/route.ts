import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, describeError, FILES_BETA, NOT_CONFIGURED } from "@/lib/anthropic";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // matches the Storage rule

/**
 * Uploads a PDF to Anthropic's Files API once and returns its file_id.
 *
 * Chat turns then reference that id instead of re-sending the document with
 * every question, which is the difference between a few kB and several MB per
 * message on a long conversation.
 */
export async function POST(req: NextRequest) {
    const anthropic = getAnthropic();
    if (!anthropic) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

    try {
        const form = await req.formData().catch(() => null);
        if (!form) {
            return NextResponse.json({ error: "Expected a multipart form upload." }, { status: 400 });
        }
        const file = form.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
            return NextResponse.json({ error: "That file is larger than the 25 MB limit." }, { status: 413 });
        }

        const uploaded = await anthropic.beta.files.upload({
            file,
            betas: [FILES_BETA],
        });

        return NextResponse.json({ fileId: uploaded.id });
    } catch (err) {
        console.error("AI upload failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
