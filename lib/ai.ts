"use client";

import { getDocumentUrl, setDocumentAiFileId, type StoredDocument } from "@/lib/firebase/documents";

/** Thrown with a message that is already safe to show the user. */
export class AiError extends Error { }

async function readError(response: Response, fallback: string) {
    const body = await response.json().catch(() => null);
    return new AiError(body?.error ?? fallback);
}

/**
 * Returns the Anthropic file id for a document, uploading it the first time.
 *
 * Sending the PDF once and referencing it by id afterwards is what keeps a long
 * conversation cheap — otherwise every question re-uploads the whole file.
 */
export async function ensureAiFileId(uid: string, document: StoredDocument) {
    if (document.aiFileId) return document.aiFileId;

    const url = await getDocumentUrl(document.storagePath);
    const blob = await fetch(url).then((r) => {
        if (!r.ok) throw new AiError("Couldn't read the stored document.");
        return r.blob();
    });

    const form = new FormData();
    form.append("file", new File([blob], document.name, { type: "application/pdf" }));

    const response = await fetch("/api/ai/upload", { method: "POST", body: form });
    if (!response.ok) throw await readError(response, "Couldn't prepare the document for the AI.");

    const { fileId } = (await response.json()) as { fileId: string };

    // Best-effort: a failed write just means we upload again next time.
    await setDocumentAiFileId(uid, document.id, fileId).catch((err) =>
        console.warn("Could not record the AI file id:", err)
    );

    return fileId;
}

export interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

export async function askAboutDocument(fileId: string, question: string, history: ChatTurn[]) {
    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, question, history }),
    });

    if (!response.ok) throw await readError(response, "The AI couldn't answer that.");

    const { reply } = (await response.json()) as { reply: string };
    return reply;
}

export async function summarizeDocument(file: File, length: "short" | "medium" | "detailed") {
    const form = new FormData();
    form.append("file", file);
    form.append("length", length);

    const response = await fetch("/api/ai/summarize", { method: "POST", body: form });
    if (!response.ok) throw await readError(response, "Couldn't summarize that document.");

    const { points } = (await response.json()) as { points: string[] };
    return points;
}

export const TRANSLATE_LANGUAGES = [
    "Arabic", "Chinese (Simplified)", "Dutch", "English", "French", "German",
    "Hindi", "Italian", "Japanese", "Korean", "Portuguese", "Russian",
    "Spanish", "Turkish", "Urdu",
] as const;

export async function translateDocument(file: File, language: string) {
    const form = new FormData();
    form.append("file", file);
    form.append("language", language);

    const response = await fetch("/api/ai/translate", { method: "POST", body: form });
    if (!response.ok) throw await readError(response, "Couldn't translate that document.");

    const { text } = (await response.json()) as { text: string };
    return text;
}

export interface DocumentInsights {
    summary: string;
    keyPoints: string[];
    entities: { name: string; kind: string }[];
    dates: { date: string; context: string }[];
    actionItems: string[];
}

export async function analyzeDocument(file: File) {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch("/api/ai/insights", { method: "POST", body: form });
    if (!response.ok) throw await readError(response, "Couldn't analyse that document.");

    const { insights } = (await response.json()) as { insights: DocumentInsights };
    return insights;
}
