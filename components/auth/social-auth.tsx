"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa6";
import type { SocialProviderId } from "@/lib/firebase/auth";

interface Provider {
    id: SocialProviderId;
    label: string;
    icon: React.ReactNode;
}

/**
 * Google keeps its own colours — its mark is only itself in full colour, and a
 * monochrome version of it reads as a different brand. GitHub's is monochrome
 * by design, so it follows the theme and stays legible in both.
 */
const providers: Provider[] = [
    { id: "google", label: "Google", icon: <FcGoogle size={20} /> },
    { id: "github", label: "GitHub", icon: <FaGithub size={20} className="text-fg" /> },
];

/**
 * The social half of the sign-in pages, below the email and password form.
 *
 * Two marks in a row, splitting the width between them. That is a far easier
 * target on a phone than the five-across row this pattern once had, and the
 * accessible name sits on the button rather than only in a `title` tooltip,
 * since a touchscreen never shows one of those.
 *
 * The props are unchanged, so both pages call this exactly as they did.
 */
export function SocialAuth({
    action,
    disabled,
    onSelect,
}: {
    /** Verb used in the accessible name, e.g. "Log in" -> "Log in with Google". */
    action: string;
    disabled?: boolean;
    onSelect: (id: SocialProviderId) => void;
}) {
    return (
        <>
            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[var(--card-border)]" />
                <span className="text-xs text-muted uppercase tracking-wide">or</span>
                <div className="flex-1 h-px bg-[var(--card-border)]" />
            </div>

            <div className="flex items-stretch gap-3">
                {providers.map((provider) => (
                    <button
                        key={provider.id}
                        type="button"
                        onClick={() => onSelect(provider.id)}
                        disabled={disabled}
                        aria-label={`${action} with ${provider.label}`}
                        title={`${action} with ${provider.label}`}
                        className="flex-1 h-12 flex items-center justify-center rounded-xl border border-card bg-card text-fg transition-colors hover:bg-[var(--background-secondary)] hover:border-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {provider.icon}
                    </button>
                ))}
            </div>
        </>
    );
}
