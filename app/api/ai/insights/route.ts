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
 * Constrains the reply to a known shape, so the page can render sections
 * directly instead of parsing prose and guessing where each part begins.
 */
const SCHEMA = {
    type: "object",
    properties: {
        summary: { type: "string" },
        keyPoints: { type: "array", items: { type: "string" } },
        entities: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    kind: { type: "string", enum: ["person", "organisation", "place", "other"] },
                },
                required: ["name", "kind"],
                additionalProperties: false,
            },
        },
        dates: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    date: { type: "string" },
                    context: { type: "string" },
                },
                required: ["date", "context"],
                additionalProperties: false,
            },
        },
        actionItems: { type: "array", items: { type: "string" } },
    },
    required: ["summary", "keyPoints", "entities", "dates", "actionItems"],
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
                        text: `Pull out the important information from this document.

Draw only on what the document says — leave a section empty rather than
inferring or filling it in. Dates should include why each one matters, and
action items should only be things the document actually asks someone to do.`,
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
            return NextResponse.json({ insights: JSON.parse(raw) });
        } catch {
            // The schema makes this unlikely, but a truncated reply would land here.
            console.error("Insights returned unparseable output:", raw.slice(0, 200));
            return NextResponse.json(
                { error: "The analysis came back incomplete. Try again." },
                { status: 502 }
            );
        }
    } catch (err) {
        console.error("AI insights failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
