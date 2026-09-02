"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { TermsAgreement } from "@/components/auth/terms-agreement";
import { signUpErrorMessage, isUserCancelled } from "@/lib/auth-errors";

/**
 * Google is the only way to create an account.
 *
 * The name, email, phone and password fields are gone with the other providers.
 * Signing up and signing in are now the same call — Google either returns an
 * existing account or a new one, and the profile document is created on first
 * arrival either way — so this page differs from /login only in its wording and
 * in asking for consent.
 *
 * The consent checkbox stays and still gates the button. It is the one thing a
 * new account needs that Google cannot supply.
 */
export default function RegisterPage() {
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogle = async () => {
        if (!agreed) {
            setError("Please accept the Terms of Service and Privacy Policy to continue.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (err) {
            // A closed popup is the user changing their mind, not a failure.
            setError(isUserCancelled(err) ? null : signUpErrorMessage(err));
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

                <h1 className="text-xl sm:text-2xl font-bold text-fg mb-2">Create your account</h1>
                <p className="text-muted text-sm mb-6">Start using every PDF tool for free</p>

                {error && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-[var(--primary)] text-xs">{error}</div>
                )}

                <div className="mb-5">
                    <TermsAgreement checked={agreed} onChange={setAgreed} id="register-terms" />
                </div>

                <GoogleAuthButton
                    label="Sign up with Google"
                    loading={loading}
                    disabled={!agreed}
                    onClick={handleGoogle}
                />

                <p className="text-center text-sm text-muted mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--primary)] hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}
