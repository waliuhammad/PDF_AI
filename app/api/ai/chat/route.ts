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

interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

const SYSTEM = `You answer questions about a PDF the user has uploaded.

Ground every answer in the document. Quote or cite the relevant part when it
helps. If the document doesn't contain the answer, say so plainly rather than
guessing from general knowledge — the user needs to be able to trust that what
you report is actually in their file.

Keep answers focused and brief. Lead with the answer, then supporting detail.`;

export async function POST(req: NextRequest) {
    const anthropic = getAnthropic();
    if (!anthropic) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

    try {
        const { fileId, question, history = [] } = (await req.json()) as {
            fileId?: string;
            question?: string;
            history?: ChatTurn[];
        };

        if (!fileId) return NextResponse.json({ error: "Missing document reference." }, { status: 400 });
        if (!question?.trim()) return NextResponse.json({ error: "Missing question." }, { status: 400 });

        // The document rides on the first user turn and is cached, so later
        // questions in the same conversation re-read it at cache rates.
        const messages: Anthropic.Beta.BetaMessageParam[] = [
            {
                role: "user",
                content: [
                    {
                        type: "document",
                        source: { type: "file", file_id: fileId },
                        cache_control: { type: "ephemeral" },
                    },
                    { type: "text", text: "Here is the document I want to ask about." },
                ],
            },
            { role: "assistant", content: "Got it — what would you like to know?" },
            ...history.map((turn) => ({ role: turn.role, content: turn.content })),
            { role: "user" as const, content: question },
        ];

        const message = await anthropic.beta.messages.create({
            model: MODEL,
            max_tokens: 16000,
            system: SYSTEM,
            messages,
            output_config: { effort: "medium" },
            fallbacks: "default",
            betas: [FILES_BETA, FALLBACK_BETA],
        });

        const reply = readReply(message);
        return NextResponse.json({ reply: reply.text, refused: !reply.ok });
    } catch (err) {
        console.error("AI chat failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
