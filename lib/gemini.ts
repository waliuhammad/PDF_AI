import { ApiError, GoogleGenAI } from "@google/genai";

/**
 * Server-only Gemini client.
 *
 * The key must never reach the browser, so it is read from GEMINI_API_KEY (not
 * NEXT_PUBLIC_*) and this module is imported only from route handlers.
 */

/**
 * The fastest current Flash model, and available on the free tier.
 *
 * Flash is the right tier for this app's work — summarising, translating and
 * proofreading a document are throughput tasks, not frontier reasoning.
 */
export const MODEL = "gemini-3.6-flash";

let client: GoogleGenAI | null = null;

export function getGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    client ??= new GoogleGenAI({ apiKey });
    return client;
}

/** Same shape every route returns when the key hasn't been configured. */
export const NOT_CONFIGURED = {
    error: "AI isn't configured yet — GEMINI_API_KEY is missing from the server environment.",
} as const;

/** A document the model should read, either inline or by uploaded file URI. */
export function documentPart(input: { uri: string; mimeType?: string } | { base64: string }) {
    return "uri" in input
        ? { type: "document" as const, uri: input.uri, mime_type: input.mimeType ?? "application/pdf" }
        : { type: "document" as const, data: input.base64, mime_type: "application/pdf" };
}

/** Maps SDK errors onto something safe to show a user. */
export function describeError(err: unknown) {
    if (err instanceof ApiError) {
        const status = err.status;
        if (status === 401 || status === 403) return "The AI API key was rejected.";
        if (status === 429) return "The free tier's rate limit was hit — try again shortly.";
        if (status === 400) return `The document couldn't be processed: ${err.message}`;
        return `The AI service returned an error (${status ?? "unknown"}).`;
    }
    if (err instanceof Error && /fetch|network|ENOTFOUND/i.test(err.message)) {
        return "Couldn't reach the AI service.";
    }
    return "Something went wrong talking to the AI service.";
}
