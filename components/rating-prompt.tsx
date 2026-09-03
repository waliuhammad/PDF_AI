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
    /**
     * Successful tool runs before the first ask, drawn at random from this
     * range the first time someone finishes a file and then kept.
     *
     * Somebody who has used three to five tools has actually formed an opinion,
     * which is the point — asking after the first download interrupts a person
     * who has barely seen the product and gets an answer worth about as much.
     * The number is random so the prompt does not arrive at a predictable
     * moment for everyone, and it is remembered rather than redrawn on each
     * visit: a threshold that rerolls would show the dialog to someone on their
     * fourth file, hide it on their fifth, and show it again on their sixth.
     */
    minSuccesses: 3,
    maxSuccesses: 5,
    /** Days to wait after someone closes it without rating. */
    daysAfterDismissal: 30,
    /**
     * How long to wait after the file lands, drawn fresh each time.
     *
     * Not immediately: a dialog that opens as the download starts reads as a
     * reaction to the click, lands while someone is still watching for their
     * file, and gets closed on reflex before it has been read. Waiting until
     * they have their file and have looked at it is the difference between
     * being asked and being interrupted.
     *
     * Random rather than a fixed pause so it does not become a beat everyone
     * learns to expect after every download.
     */
    minDelayMs: 6000,
    maxDelayMs: 18000,
};

/**
 * How long the five stars take to finish filling, matching the stagger and
 * duration in StarRating's animate-star-fill.
 */
const FILL_ANIMATION_MS = 800;

const KEY = {
    rated: "pdfai:rating:rated",
    dismissedAt: "pdfai:rating:dismissedAt",
    /** Tools finished so far, across visits — three of them rarely happen in one. */
    successes: "pdfai:rating:successes",
    /** The draw, kept so the target stops moving under the person. */
    threshold: "pdfai:rating:threshold",
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

/** How many tools this person has to finish before being asked. Drawn once. */
function drawThreshold(): number {
    const { minSuccesses, maxSuccesses } = FREQUENCY;

    const stored = Number(readLocal(KEY.threshold));
    if (Number.isInteger(stored) && stored >= minSuccesses && stored <= maxSuccesses) {
        return stored;
    }

    const picked = minSuccesses + Math.floor(Math.random() * (maxSuccesses - minSuccesses + 1));
    writeLocal(KEY.threshold, String(picked));
    return picked;
}

/** A fresh pause before each appearance, somewhere in the configured range. */
function drawDelay(): number {
    const { minDelayMs, maxDelayMs } = FREQUENCY;
    return minDelayMs + Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1));
}

/** Records a finished tool and returns the running total. */
function countSuccess(): number {
    const next = (Number(readLocal(KEY.successes)) || 0) + 1;
    writeLocal(KEY.successes, String(next));
    return next;
}

/**
 * Asks for a rating once someone has actually used the product — three to five
 * finished files, drawn at random, counted across visits rather than within one.
 *
 * Mounted once in the tool layout and silent until then, so it costs a listener
 * and nothing else on the pages it sits on.
 *
 * Whether someone is signed in comes from the session hint cookie rather than
 * Firebase Auth. Loading the SDK on all twenty-one public tool pages to decide
 * whether to show a dialog would undo the work of keeping it off them, and the
 * cookie is enough for this decision: the API verifies the real session before
 * writing anything, and a stale cookie costs one dismissed dialog.
 *
 * localStorage records how many tools have been finished, the threshold drawn
 * for this browser, and whether someone has already rated or recently declined.
 * It is not storing the rating — that lives in Firestore — only whether to ask,
 * which is a per-browser question and belongs in the browser.
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

    const eligible = useCallback((total: number): boolean => {
        if (typeof window === "undefined") return false;
        if (shown.current || dismissedThisSession.current) return false;
        if (!hasSessionHint()) return false;
        if (readLocal(KEY.rated)) return false;

        const dismissedAt = Number(readLocal(KEY.dismissedAt));
        if (Number.isFinite(dismissedAt) && dismissedAt > 0) {
            const waitUntil = dismissedAt + FREQUENCY.daysAfterDismissal * 864e5;
            if (Date.now() < waitUntil) return false;
        }

        return total >= drawThreshold();
    }, []);

    useEffect(() => {
        // The wait is long enough now that someone can leave the tools before
        // it elapses, so the timer has to be cancellable.
        let timer = 0;

        const stop = onToolSuccess(() => {
            // The stored count is what carries three tool uses across three
            // visits. The ref is the fallback for a browser that refuses
            // storage, where the count would otherwise be stuck at one forever.
            successes.current += 1;
            const total = Math.max(successes.current, countSuccess());

            if (!eligible(total)) return;

            // Claimed now rather than when the dialog opens, so a second
            // download during the wait cannot queue a second one behind it.
            shown.current = true;
            timer = window.setTimeout(() => setOpen(true), drawDelay());
        });

        return () => {
            stop();
            window.clearTimeout(timer);
        };
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
            const [res] = await Promise.all([
                fetch("/api/rating", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rating: stars }),
                }),
                // The stars fill left to right over about three quarters of a
                // second. A save that returns sooner would replace them with the
                // thank you mid-animation, so the person never sees the row they
                // just chose. Waiting for the slower of the two costs nothing:
                // the request is already in flight.
                new Promise((done) => window.setTimeout(done, FILL_ANIMATION_MS)),
            ]);

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
