"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { TermsNotice } from "@/components/auth/terms-agreement";
import { signInErrorMessage, isUserCancelled } from "@/lib/auth-errors";

/**
 * Where to go after signing in.
 *
 * proxy.ts appends ?next= when it turns someone away, so they land where they
 * were headed rather than always on the dashboard.
 *
 * Only a path on this site is accepted. Taking the parameter at face value
 * would let a link like /login?next=https://example.com bounce a freshly
 * signed-in visitor straight off the site — the standard open redirect. The
 * leading-slash-but-not-double-slash test rejects both absolute URLs and
 * protocol-relative ones.
 */
function destinationAfterLogin(): string {
    if (typeof window === "undefined") return "/dashboard";

    const next = new URLSearchParams(window.location.search).get("next");
    if (next && /^\/(?!\/)/.test(next)) return next;

    return "/dashboard";
}

/**
 * Google is the only way in.
 *
 * The email and password form, the "forgot password" link and the four other
 * providers were all removed together. One provider means there is no choice to
 * present and no credential for this page to hold, so what is left is a single
 * button and the reason to press it.
 */
export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push(destinationAfterLogin());
        } catch (err) {
            // A closed popup is the user changing their mind, not a failure.
            setError(isUserCancelled(err) ? null : signInErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 bg-[var(--background-secondary)]">
            <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-card border border-card shadow-sm">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-fg mb-6 sm:mb-8">
                    <FileText className="text-[var(--primary)]" size={22} />
                    PDF<span className="text-[var(--primary)]">AI</span>
                </Link>

                <h1 className="text-xl sm:text-2xl font-bold text-fg mb-2">Welcome back</h1>
                <p className="text-muted text-sm mb-6">Log in to continue to your account</p>

                {error && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-[var(--primary)] text-xs">{error}</div>
                )}

                <GoogleAuthButton label="Log in with Google" loading={loading} onClick={handleGoogle} />

                <div className="mt-6">
                    <TermsNotice />
                </div>

                <p className="text-center text-sm text-muted mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-[var(--primary)] hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}
