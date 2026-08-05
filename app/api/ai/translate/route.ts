import { NextRequest, NextResponse } from "next/server";
import { describeError, documentPart, getGemini, MODEL, NOT_CONFIGURED } from "@/lib/gemini";

export const runtime = "nodejs";

/** Offered in the UI; anything else is rejected rather than passed through. */
export const LANGUAGES = [
    "Arabic", "Chinese (Simplified)", "Dutch", "English", "French", "German",
    "Hindi", "Italian", "Japanese", "Korean", "Portuguese", "Russian",
    "Spanish", "Turkish", "Urdu",
] as const;

export async function POST(req: NextRequest) {
    const ai = getGemini();
    if (!ai) return NextResponse.json(NOT_CONFIGURED, { status: 501 });

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

        const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

        const interaction = await ai.interactions.create({
            model: MODEL,
            input: [
                documentPart({ base64 }),
                {
                    type: "text",
                    text: `Translate this document into ${target}.

Keep the document's structure: preserve headings, paragraph breaks, lists and
table rows in the same order. Translate the content only — leave names, code,
URLs and numbers as they are. Return the translation on its own, with no
preamble and no notes about the translation.`,
                },
            ],
        });

        const text = (interaction.output_text ?? "").trim();
        if (!text) {
            return NextResponse.json(
                { error: "No translation came back. The document may be empty or unreadable." },
                { status: 422 }
            );
        }

        return NextResponse.json({ language: target, text });
    } catch (err) {
        console.error("AI translate failed:", err);
        return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
}
