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

const LENGTHS = {
    short: "3 key points",
    medium: "5 key points",
    detailed: "8 to 10 key points",
} as const;

type Length = keyof typeof LENGTHS;

export const runtimeConfig = { maxDuration: 60 };

export async function POST(req: NextRequest) {
    const anthropic = getAnthropic();
    if (!anthropic) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

    try {
        const form = await req.formData().catch(() => null);
        if (!form) {
            return NextResponse.json({ error: "Expected a multipart form upload." }, { status: 400 });
        }
        const file = form.get("file");
        const requested = String(form.get("length") ?? "medium");
        const length: Length = requested in LENGTHS ? (requested as Length) : "medium";

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
        }

        const uploaded = await anthropic.beta.files.upload({ file, betas: [FILES_BETA] });

        const messages: Anthropic.Beta.BetaMessageParam[] = [
            {
                role: "user",
                content: [
                    { type: "document", source: { type: "file", file_id: uploaded.id } },
                    {
                        type: "text",
                        text: `Summarize this document as ${LENGTHS[length]}.

Return one point per line, as plain sentences. No numbering, no bullet
characters, no preamble — just the points themselves, each on its own line.
Draw only on what the document actually says.`,
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
        if (!reply.ok) {
            return NextResponse.json({ error: reply.text }, { status: 422 });
        }

        const points = reply.text
            .split("\n")
            .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
            .filter(Boolean);

        return NextResponse.json({ points });
    } catch (err) {
        console.error("AI summarize failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
