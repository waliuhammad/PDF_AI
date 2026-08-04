import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client.
 *
 * The key must never be exposed to the browser, so it is read from
 * ANTHROPIC_API_KEY (not NEXT_PUBLIC_*) and this module is imported only from
 * route handlers.
 */

export const MODEL = "claude-opus-5";

/** Uploading a document and referencing it by file_id both need this. */
export const FILES_BETA = "files-api-2025-04-14";

/**
 * Re-runs a request on another model if safety classifiers decline it, rather
 * than surfacing the refusal. "default" lets Anthropic pick the substitute by
 * refusal category instead of pinning a model we would later have to migrate.
 */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

let client: Anthropic | null = null;

/**
 * Returns the client, or null when the server has no credentials.
 *
 * The check is explicit rather than relying on the SDK to complain: the
 * constructor succeeds without credentials and only fails once a request is
 * made, which would surface as an opaque auth error mid-conversation instead
 * of a clear "not configured yet" up front. Both variables the SDK reads are
 * accepted so either can be used in deployment.
 */
export function getAnthropic() {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;

    client ??= new Anthropic();
    return client;
}

/** Same shape every route returns when the key hasn't been configured. */
export const NOT_CONFIGURED = {
    error: "AI isn't configured yet — ANTHROPIC_API_KEY is missing from the server environment.",
} as const;

/**
 * Pulls the plain text out of a response, after checking the model didn't
 * decline. Reading content[0] without this breaks on a refusal, where content
 * is empty or partial.
 */
export function readReply(message: Anthropic.Beta.BetaMessage) {
    if (message.stop_reason === "refusal") {
        return {
            ok: false as const,
            text: "I can't help with that — the request was declined by safety filters.",
        };
    }

    const text = message.content
        .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();

    return { ok: true as const, text };
}

/** Maps SDK errors onto something safe to show a user. */
export function describeError(err: unknown) {
    if (err instanceof Anthropic.AuthenticationError) return "The AI API key was rejected.";
    if (err instanceof Anthropic.RateLimitError) return "Too many requests right now — try again shortly.";
    if (err instanceof Anthropic.BadRequestError) return `The document couldn't be processed: ${err.message}`;
    if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the AI service.";
    if (err instanceof Anthropic.APIError) return `The AI service returned an error (${err.status}).`;
    return "Something went wrong talking to the AI service.";
}
