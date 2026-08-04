"use client";

import Link from "next/link";

/** Consent checkbox linking to the Terms and Privacy pages. */
export function TermsAgreement({
    checked,
    onChange,
    id = "terms",
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--card-border)] accent-[var(--primary)] cursor-pointer"
            />
            <label htmlFor={id} className="text-xs text-muted leading-5 cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-[var(--primary)] hover:underline">
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                    Privacy Policy
                </Link>
                .
            </label>
        </div>
    );
}
