"use client";

/**
 * "A tool just finished and gave the person their file."
 *
 * An event rather than a prop or a context call, because the twenty-one tool
 * pages have nothing else in common — they do not share a hook, they finish in
 * different ways, and threading a callback through all of them to ask one
 * question would be twenty-one edits that can drift. Anything that wants to
 * know listens; anything that finishes work announces it.
 *
 * It is announced from downloadBlob, which is the single line every tool
 * reaches only once its work has actually succeeded and produced a file. A
 * failed conversion never gets there, which is exactly the distinction the
 * rating prompt needs and the reason it is not wired to a click.
 */

const TOOL_SUCCESS = "pdfai:tool-success";

/** Announce that a tool finished successfully. Safe to call during SSR. */
export function notifyToolSuccess(): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(TOOL_SUCCESS));
}

/** Listen for successful tool runs. Returns the unsubscribe. */
export function onToolSuccess(handler: () => void): () => void {
    if (typeof window === "undefined") return () => { };

    window.addEventListener(TOOL_SUCCESS, handler);
    return () => window.removeEventListener(TOOL_SUCCESS, handler);
}
