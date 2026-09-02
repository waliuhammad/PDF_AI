"use client";

import type { SocialProviderId } from "@/lib/firebase/auth";
import { GoogleAuthButton } from "./google-auth-button";

/**
 * The social half of the sign-in pages, below the email and password form.
 *
 * Google is the only provider now — Facebook, GitHub, X and Apple were removed.
 * That changes what this should look like as well as what it offers: five
 * providers had to be bare brand marks in a row to fit, which left each one
 * carrying its name only in a `title` tooltip that a touchscreen never shows.
 * With a single provider there is room to say what the button does, so it says
 * "Log in with Google" or "Sign up with Google" beside the mark.
 *
 * The props are unchanged, so both pages call this exactly as before.
 */
export function SocialAuth({
    action,
    disabled,
    onSelect,
}: {
    /** Verb shown on the button, e.g. "Log in" -> "Log in with Google". */
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

            <GoogleAuthButton
                label={`${action} with Google`}
                disabled={disabled}
                onClick={() => onSelect("google")}
            />
        </>
    );
}
