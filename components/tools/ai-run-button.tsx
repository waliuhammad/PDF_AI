"use client";

import { ArrowRight, Loader2 } from "lucide-react";

/**
 * The button that starts an AI tool.
 *
 * Grammar's was a purple pill that showed a spinner while it worked and an
 * arrow when it was ready; Translate's was a dark rectangle with the same two
 * icons; OCR's and Summarize's were dark rectangles with no icons at all, so
 * neither of those gave any sign of being busy beyond the word changing. Four
 * buttons doing one job in three different costumes.
 *
 * Grammar's is the one they all follow now, and it lives here so there is
 * nothing left to drift out of step.
 */
export function AiRunButton({
    /** Idle label, e.g. "Translate PDF". */
    label,
    /** Label while working, e.g. "Translating...". */
    loadingLabel,
    loading = false,
    disabled = false,
    onClick,
    /** Translate's control submits a form; the rest are ordinary buttons. */
    type = "button",
}: {
    label: string;
    loadingLabel: string;
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit";
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-900/20"
        >
            {loading ? (
                <>
                    <Loader2 size={15} className="animate-spin" />
                    {loadingLabel}
                </>
            ) : (
                <>
                    {label}
                    <ArrowRight size={15} />
                </>
            )}
        </button>
    );
}
