"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { onToolSuccess } from "@/lib/tool-success";
import { hasSessionHint } from "@/lib/session-hint";

/**
 * Everything about how often this interrupts, in one place.
 *
 * Kept as a literal rather than spread through the logic so changing "ask after
 * the second file instead of the first" is one number, not an afternoon reading
 * the component.
 */
const FREQUENCY = {
    /** Successful tool runs in this session before the first ask. */
    afterSuccesses: 1,
    /** Days to wait after someone closes it without rating. */
    daysAfterDismissal: 30,
    /** Breathing room after the file arrives, so the dialog is not part of the click. */
    delayMs: 1200,
};

const KEY = {
    rated: "pdfai:rating:rated",
    dismissedAt: "pdfai:rating:dismissedAt",
};

/** Storage throws in private mode and in some embedded browsers. */
function readLocal(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeLocal(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // A prompt that shows once more than intended is better than a crash.
    }
}

/**
 * Asks for a rating after a tool has actually produced something.
 *
 * Mounted once in the tool layout and silent until a tool succeeds, so it costs
 * a listener and nothing else on the pages it sits on.
 *
 * Whether someone is signed in comes from the session hint cookie rather than
 * Firebase Auth. Loading the SDK on all twenty-one public tool pages to decide
 * whether to show a dialog would undo the work of keeping it off them, and the
 * cookie is enough for this decision: the API verifies the real session before
 * writing anything, and a stale cookie costs one dismissed dialog.
 *
 * localStorage records whether someone has rated or recently declined. It is
 * not storing the rating — that lives in Firestore — only whether to ask, which
 * is a per-browser question and belongs in the browser.
 */
export function RatingPrompt() {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [state, setState] = useState<"idle" | "saving" | "done">("idle");

    // Refs, not state: these gate an event handler and must not re-render or
    // re-subscribe it. A session dismissal lives here so it lasts exactly as
    // long as the page does, which is the definition of "not again right now".
    const successes = useRef(0);
    const dismissedThisSession = useRef(false);
    const shown = useRef(false);

    const eligible = useCallback((): boolean => {
        if (typeof window === "undefined") return false;
        if (shown.current || dismissedThisSession.current) return false;
        if (!hasSessionHint()) return false;
        if (readLocal(KEY.rated)) return false;

        const dismissedAt = Number(readLocal(KEY.dismissedAt));
        if (Number.isFinite(dismissedAt) && dismissedAt > 0) {
            const waitUntil = dismissedAt + FREQUENCY.daysAfterDismissal * 864e5;
            if (Date.now() < waitUntil) return false;
        }

        return successes.current >= FREQUENCY.afterSuccesses;
    }, []);

    useEffect(() => {
        return onToolSuccess(() => {
            successes.current += 1;
            if (!eligible()) return;

            shown.current = true;
            // Let the download settle first. Opening a dialog in the same frame
            // as the file arriving reads as a reaction to the click rather than
            // to the result.
            window.setTimeout(() => setOpen(true), FREQUENCY.delayMs);
        });
    }, [eligible]);

    const close = useCallback(() => {
        setOpen(false);
        // Only a close without a rating counts as a refusal. Closing the thank
        // you afterwards must not schedule another ask a month out.
        if (state !== "done") {
            dismissedThisSession.current = true;
            writeLocal(KEY.dismissedAt, String(Date.now()));
        }
    }, [state]);

    // Escape closes it, like any other dialog.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, close]);

    const submit = async (stars: number) => {
        if (state !== "idle") return; // a second click must not send a second rating
        setRating(stars);
        setState("saving");

        try {
            const res = await fetch("/api/rating", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: stars }),
            });

            if (!res.ok) {
                // Nothing useful to say here — a rating is a courtesy, and an
                // error dialog over a finished file is worse than silence. The
                // ask simply does not count, so it can happen again later.
                setOpen(false);
                setState("idle");
                dismissedThisSession.current = true;
                return;
            }

            writeLocal(KEY.rated, "1");
            setState("done");
            window.setTimeout(() => setOpen(false), 1800);
        } catch {
            setOpen(false);
            setState("idle");
            dismissedThisSession.current = true;
        }
    };

    if (!open) return null;

    return (
        // Sits above the page but does not block it: no scroll lock, and the
        // backdrop closes rather than trapping. Someone who wants to carry on
        // working can, which is the difference between a prompt and a toll gate.
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-prompt-title"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-[2px]"
            />

            <div className="relative w-full max-w-sm rounded-2xl border border-card bg-card p-6 shadow-xl">
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="absolute right-3 top-3 rounded-lg p-1.5 text-muted transition-colors hover:text-fg"
                >
                    <X size={16} />
                </button>

                {state === "done" ? (
                    <div className="flex flex-col items-center py-4 text-center">
                        <CheckCircle2 size={30} className="text-emerald-600 dark:text-emerald-400" />
                        <p className="mt-3 text-base font-semibold text-fg">Thank you for your feedback!</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 id="rating-prompt-title" className="text-lg font-semibold text-fg">
                            How was your experience?
                        </h2>
                        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">
                            We&apos;d love to hear your feedback. Please rate your experience.
                        </p>

                        <div className="mt-5 flex justify-center">
                            <StarRating
                                value={rating}
                                onSelect={submit}
                                disabled={state === "saving"}
                                label="Rate your experience"
                            />
                        </div>

                        <div className="mt-4 flex h-5 items-center justify-center">
                            {state === "saving" && (
                                <span className="flex items-center gap-1.5 text-xs text-muted">
                                    <Loader2 size={13} className="animate-spin" />
                                    Saving your rating…
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
