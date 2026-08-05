"use client";

import { getDocumentUrl, setDocumentAiFileId, type StoredDocument } from "@/lib/firebase/documents";

/** Thrown with a message that is already safe to show the user. */
export class AiError extends Error { }

async function readError(response: Response, fallback: string) {
    const body = await response.json().catch(() => null);
    return new AiError(body?.error ?? fallback);
}

/**
 * Returns the AI file reference for a document, uploading it the first time.
 *
 * Sending the PDF once and referencing it by id afterwards is what keeps a long
 * conversation cheap — otherwise every question re-uploads the whole file.
 */
export async function ensureAiFileId(uid: string, document: StoredDocument) {
    // The provider expires uploaded files, so a stored reference is a cache
    // with a shelf life rather than a permanent id. Re-upload once it lapses,
    // with a margin so a long conversation cannot expire mid-answer.
    const MARGIN_MS = 10 * 60 * 1000;
    const usable =
        document.aiFileId &&
        document.aiFileExpiresAt &&
        document.aiFileExpiresAt - MARGIN_MS > Date.now();

    if (usable) return document.aiFileId as string;

    const url = await getDocumentUrl(document.storagePath);
    const blob = await fetch(url).then((r) => {
        if (!r.ok) throw new AiError("Couldn't read the stored document.");
        return r.blob();
    });

    const form = new FormData();
    form.append("file", new File([blob], document.name, { type: "application/pdf" }));

    const response = await fetch("/api/ai/upload", { method: "POST", body: form });
    if (!response.ok) throw await readError(response, "Couldn't prepare the document for the AI.");

    const { fileId, expiresAt } = (await response.json()) as { fileId: string; expiresAt: number };

    // Best-effort: a failed write just means we upload again next time.
    await setDocumentAiFileId(uid, document.id, fileId, expiresAt).catch((err) =>
        console.warn("Could not record the AI file reference:", err)
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

export interface GrammarIssue {
    excerpt: string;
    suggestion: string;
    explanation: string;
    kind: string;
}

export interface GrammarReport {
    assessment: string;
    issues: GrammarIssue[];
}

export async function checkGrammar(file: File) {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch("/api/ai/grammar", { method: "POST", body: form });
    if (!response.ok) throw await readError(response, "Couldn't check that document.");

    const { report } = (await response.json()) as { report: GrammarReport };
    return report;
}
