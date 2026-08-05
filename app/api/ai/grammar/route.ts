import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
    describeError,
    FALLBACK_BETA,
    FILES_BETA,
    getAnthropic,
    MODEL,
    NOT_CONFIGURED,
} from "@/lib/anthropic";

export const runtime = "nodejs";

/**
 * Constrains the reply so the page can render each issue as a row with the
 * original text beside the correction, instead of parsing prose and guessing
 * which part is the quote and which is the fix.
 */
const SCHEMA = {
    type: "object",
    properties: {
        assessment: { type: "string" },
        issues: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    excerpt: { type: "string" },
                    suggestion: { type: "string" },
                    explanation: { type: "string" },
                    kind: {
                        type: "string",
                        enum: ["spelling", "grammar", "punctuation", "style", "clarity"],
                    },
                },
                required: ["excerpt", "suggestion", "explanation", "kind"],
                additionalProperties: false,
            },
        },
    },
    required: ["assessment", "issues"],
    additionalProperties: false,
} as const;

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

        const uploaded = await anthropic.beta.files.upload({ file, betas: [FILES_BETA] });

        const messages: Anthropic.Beta.BetaMessageParam[] = [
            {
                role: "user",
                content: [
                    { type: "document", source: { type: "file", file_id: uploaded.id } },
                    {
                        type: "text",
                        text: `Proofread this document.

For each problem, quote the original wording exactly as it appears so the
writer can find it, give the corrected version, and say briefly what was wrong.

Report real errors and phrasing that genuinely impedes the reader. Do not
report matters of preference where the original is already correct, and do not
invent problems to fill the list — a clean document should come back with an
empty list and an assessment that says so.`,
                    },
                ],
            },
        ];

        const message = await anthropic.beta.messages.create({
            model: MODEL,
            max_tokens: 16000,
            messages,
            output_config: {
                effort: "medium",
                format: { type: "json_schema", schema: SCHEMA },
            },
            fallbacks: "default",
            betas: [FILES_BETA, FALLBACK_BETA],
        });

        if (message.stop_reason === "refusal") {
            return NextResponse.json(
                { error: "That document was declined by safety filters." },
                { status: 422 }
            );
        }

        const raw = message.content
            .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
            .map((b) => b.text)
            .join("");

        try {
            return NextResponse.json({ report: JSON.parse(raw) });
        } catch {
            console.error("Grammar check returned unparseable output:", raw.slice(0, 200));
            return NextResponse.json(
                { error: "The check came back incomplete. Try again." },
                { status: 502 }
            );
        }
    } catch (err) {
        console.error("AI grammar check failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
