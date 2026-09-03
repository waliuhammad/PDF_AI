"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { onToolSuccess } from "@/lib/tool-success";

/**
 * How long the confirmation stays up.
 *
 * It is an acknowledgement, not a state: long enough to be read after looking
 * away at a download shelf, short enough that it is gone before the next file
 * is picked and cannot be mistaken for a message about that one.
 */
const VISIBLE_MS = 8000;

/**
 * "Your file has been made and handed to you."
 *
 * Every tool ends the same way — a blob and a download — and until now most of
 * them ended silently. The browser puts the file somewhere the page cannot see,
 * so without a line like this the only feedback for the last click is that the
 * button stopped spinning, which reads the same as nothing happening.
 *
 * It listens for the same download signal the rating prompt uses rather than
 * taking a callback, so a tool wires it up by rendering it — there is no
 * success path to remember to call, and no way for the two to disagree about
 * whether the file was actually produced. A failed run never announces success,
 * so this never appears over an error.
 *
 * `message` is passed in rather than derived from the route: "signed",
 * "merged", "unlocked" is the one thing that genuinely differs per tool, and a
 * lookup table keyed by pathname would put that wording somewhere nobody
 * editing the tool would think to look.
 */
export function DownloadNotice({ message }: { message: string }) {
    const [shown, setShown] = useState(false);
    const timer = useRef(0);

    useEffect(() => {
        const stop = onToolSuccess(() => {
            setShown(true);
            // A second download restarts the clock rather than letting the
            // first one's timer cut the confirmation short.
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setShown(false), VISIBLE_MS);
        });

        return () => {
            stop();
            window.clearTimeout(timer.current);
        };
    }, []);

    if (!shown) return null;

    return (
        <div
            // Announced politely: it confirms something the person just did, so
            // it should not interrupt whatever a screen reader is mid-sentence on.
            role="status"
            aria-live="polite"
            className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[13px] sm:text-sm font-semibold flex items-start sm:items-center justify-center gap-2"
        >
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 sm:mt-0" />
            <span>{message}</span>
        </div>
    );
}
