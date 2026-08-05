import { NextRequest, NextResponse } from "next/server";
import { describeError, getGemini, NOT_CONFIGURED } from "@/lib/gemini";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // matches the Storage rule

/**
 * Uploads a PDF once and returns the file URI chat turns reference.
 *
 * Sending the document once and referring to it afterwards is the difference
 * between a few kB and several MB per message on a long conversation.
 *
 * Gemini expires uploaded files (typically after 48 hours), so the expiry is
 * returned alongside the URI and the caller re-uploads once it lapses.
 */
export async function POST(req: NextRequest) {
    const ai = getGemini();
    if (!ai) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

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

        const uploaded = await ai.files.upload({
            file,
            config: { mimeType: "application/pdf", displayName: file.name },
        });

        if (!uploaded.uri) {
            return NextResponse.json({ error: "The upload didn't return a usable reference." }, { status: 502 });
        }

        const expiresAt = uploaded.expirationTime
            ? Date.parse(uploaded.expirationTime)
            : Date.now() + 40 * 60 * 60 * 1000; // conservative default if unreported

        return NextResponse.json({ fileId: uploaded.uri, expiresAt });
    } catch (err) {
        console.error("AI upload failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
