import { NextRequest, NextResponse } from "next/server";
import { describeError, documentPart, getGemini, MODEL, NOT_CONFIGURED } from "@/lib/gemini";

export const runtime = "nodejs";

const LENGTHS = {
    short: "3 key points",
    medium: "5 key points",
    detailed: "8 to 10 key points",
} as const;

type Length = keyof typeof LENGTHS;

export async function POST(req: NextRequest) {
    const ai = getGemini();
    if (!ai) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

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

        const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

        const interaction = await ai.interactions.create({
            model: MODEL,
            input: [
                documentPart({ base64 }),
                {
                    type: "text",
                    text: `Summarize this document as ${LENGTHS[length]}.

Return one point per line, as plain sentences. No numbering, no bullet
characters, no preamble — just the points themselves, each on its own line.
Draw only on what the document actually says.`,
                },
            ],
        });

        const points = (interaction.output_text ?? "")
            .split("\n")
            .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
            .filter(Boolean);

        if (points.length === 0) {
            return NextResponse.json(
                { error: "No summary came back. The document may be empty or unreadable." },
                { status: 422 }
            );
        }

        return NextResponse.json({ points });
    } catch (err) {
        console.error("AI summarize failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
