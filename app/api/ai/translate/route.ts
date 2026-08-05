import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
    describeError,
    FALLBACK_BETA,
    FILES_BETA,
    getAnthropic,
    MODEL,
    NOT_CONFIGURED,
    readReply,
} from "@/lib/anthropic";

export const runtime = "nodejs";

/** Offered in the UI; anything else is rejected rather than passed through. */
export const LANGUAGES = [
    "Arabic", "Chinese (Simplified)", "Dutch", "English", "French", "German",
    "Hindi", "Italian", "Japanese", "Korean", "Portuguese", "Russian",
    "Spanish", "Turkish", "Urdu",
] as const;

export async function POST(req: NextRequest) {
    const anthropic = getAnthropic();
    if (!anthropic) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

    try {
        const form = await req.formData().catch(() => null);
        if (!form) {
            return NextResponse.json({ error: "Expected a multipart form upload." }, { status: 400 });
        }

        const file = form.get("file");
        const target = String(form.get("language") ?? "");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
        }
        if (!(LANGUAGES as readonly string[]).includes(target)) {
            return NextResponse.json({ error: "Choose a language from the list." }, { status: 400 });
        }

        const uploaded = await anthropic.beta.files.upload({ file, betas: [FILES_BETA] });

        const messages: Anthropic.Beta.BetaMessageParam[] = [
            {
                role: "user",
                content: [
                    { type: "document", source: { type: "file", file_id: uploaded.id } },
                    {
                        type: "text",
                        text: `Translate this document into ${target}.

Keep the document's structure: preserve headings, paragraph breaks, lists and
table rows in the same order. Translate the content only — leave names, code,
URLs and numbers as they are. Return the translation on its own, with no
preamble and no notes about the translation.`,
                    },
                ],
            },
        ];

        const message = await anthropic.beta.messages.create({
            model: MODEL,
            max_tokens: 16000,
            messages,
            output_config: { effort: "medium" },
            fallbacks: "default",
            betas: [FILES_BETA, FALLBACK_BETA],
        });

        const reply = readReply(message);
        if (!reply.ok) return NextResponse.json({ error: reply.text }, { status: 422 });

        return NextResponse.json({ language: target, text: reply.text });
    } catch (err) {
        console.error("AI translate failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
