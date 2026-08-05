import { NextRequest, NextResponse } from "next/server";
import { describeError, documentPart, getGemini, MODEL, NOT_CONFIGURED } from "@/lib/gemini";

export const runtime = "nodejs";

interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

const INSTRUCTIONS = `You answer questions about the attached PDF.

Ground every answer in the document, and quote the relevant part when it helps.
If the document doesn't contain the answer, say so plainly rather than guessing
from general knowledge — the user needs to trust that what you report is
actually in their file.

Keep answers focused and brief. Lead with the answer, then supporting detail.`;

export async function POST(req: NextRequest) {
    const ai = getGemini();
    if (!ai) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

    try {
        const { fileId, question, history = [] } = (await req.json()) as {
            fileId?: string;
            question?: string;
            history?: ChatTurn[];
        };

        if (!fileId) return NextResponse.json({ error: "Missing document reference." }, { status: 400 });
        if (!question?.trim()) return NextResponse.json({ error: "Missing question." }, { status: 400 });

        // The document and the standing instructions ride on the first turn;
        // the rest is the conversation so far, then the new question.
        const interaction = await ai.interactions.create({
            model: MODEL,
            input: [
                {
                    role: "user",
                    content: [
                        documentPart({ uri: fileId }),
                        { type: "text", text: INSTRUCTIONS },
                    ],
                },
                { role: "model", content: "Understood — what would you like to know about it?" },
                ...history.map((turn) => ({
                    role: turn.role === "assistant" ? "model" : "user",
                    content: turn.content,
                })),
                { role: "user", content: question },
            ],
        });

        const reply = (interaction.output_text ?? "").trim();
        if (!reply) {
            return NextResponse.json(
                { error: "No answer came back. Try rephrasing the question." },
                { status: 422 }
            );
        }

        return NextResponse.json({ reply });
    } catch (err) {
        console.error("AI chat failed:", err);

        // An expired file URI reads as a bad request; tell the caller to re-upload
        // rather than surfacing it as a generic failure.
        const message = err instanceof Error ? err.message : "";
        if (/not found|expired|PERMISSION_DENIED/i.test(message)) {
            return NextResponse.json(
                { error: "That document needs re-uploading — the AI service expires stored files.", expired: true },
                { status: 410 }
            );
        }

        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
