"use client";

import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

/**
 * The single way in, now that email, phone and the other four providers are
 * gone.
 *
 * Full width with the label beside the mark, rather than the bare icon it
 * replaced. That icon was one of five in a row and carried its provider name
 * only in a `title` tooltip — which a touchscreen never shows, so on a phone the
 * buttons were five unlabelled circles. When there is exactly one way to sign
 * in, it should say what it is.
 */
export function GoogleAuthButton({
    /** The whole label, e.g. "Sign up with Google" — the two pages word it differently. */
    label,
    loading = false,
    disabled = false,
    onClick,
}: {
    label: string;
    loading?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-card bg-card text-fg text-sm font-medium hover:bg-[var(--background-secondary)] hover:border-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {/* Fixed-width slot: the spinner and the mark are different sizes,
                and without it the label jumps sideways as one swaps for the other. */}
            <span className="w-5 flex items-center justify-center shrink-0">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <FcGoogle size={20} />}
            </span>
            {loading ? "Opening Google…" : label}
        </button>
    );
}
