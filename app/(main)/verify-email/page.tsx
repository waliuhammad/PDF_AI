"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FileText, MailCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { refreshEmailVerified, sendVerificationEmail } from "@/lib/firebase/auth";

const RESEND_COOLDOWN_SECONDS = 60;
const POLL_INTERVAL_MS = 5000;

export default function VerifyEmailPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [verified, setVerified] = useState(false);
    const [checking, setChecking] = useState(false);
    const [sending, setSending] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const check = useCallback(async () => {
        const isVerified = await refreshEmailVerified().catch(() => false);
        if (isVerified) setVerified(true);
        return isVerified;
    }, []);

    // The link is opened in a different tab (or on a phone), so nothing happens
    // in this one until we re-read the account. Poll until it lands.
    useEffect(() => {
        if (!user || verified) return;

        const id = setInterval(() => { void check(); }, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [user, verified, check]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0) return;

        setSending(true);
        setError(null);
        setNotice(null);
        try {
            await sendVerificationEmail();
            setNotice("Sent. Check your inbox — and your spam folder.");
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            const code = (err as { code?: string })?.code;
            setError(
                code === "auth/too-many-requests"
                    ? "Too many attempts. Wait a few minutes before trying again."
                    : err instanceof Error
                        ? err.message
                        : "Couldn't send the email."
            );
        } finally {
            setSending(false);
        }
    };

    const handleCheck = async () => {
        setChecking(true);
        setError(null);
        setNotice(null);

        const isVerified = await check();
        if (!isVerified) setError("Not verified yet. Open the link in the email, then check again.");

        setChecking(false);
    };

    const card = "w-full max-w-md p-8 rounded-2xl bg-card border border-card shadow-sm text-center";

    return (
        <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--background-secondary)]">
            <div className={card}>
                <Link href="/" className="flex items-center justify-center gap-2 text-xl font-bold text-fg mb-8">
                    <FileText className="text-[var(--primary)]" size={22} />
                    PDF<span className="text-[var(--primary)]">AI</span>
                </Link>

                {loading ? (
                    <p className="text-sm text-muted">Loading...</p>
                ) : !user ? (
                    <>
                        <h1 className="text-2xl font-bold text-fg mb-2">You&apos;re signed out</h1>
                        <p className="text-muted text-sm mb-6">
                            Sign in first, and we&apos;ll pick up where you left off.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
                        >
                            Go to login
                        </Link>
                    </>
                ) : verified || user.emailVerified ? (
                    <>
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="text-green-600" size={26} />
                        </div>
                        <h1 className="text-2xl font-bold text-fg mb-2">Email verified</h1>
                        <p className="text-muted text-sm mb-6">
                            Thanks — <span className="text-fg">{user.email}</span> is confirmed.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
                        >
                            Continue to dashboard
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                            <MailCheck className="text-[var(--primary)]" size={26} />
                        </div>
                        <h1 className="text-2xl font-bold text-fg mb-2">Verify your email</h1>
                        <p className="text-muted text-sm mb-8">
                            We sent a link to <span className="text-fg">{user.email}</span>. Open it to
                            confirm your address — this page updates on its own once you do.
                        </p>

                        {error && (
                            <p className="flex items-start gap-1.5 text-sm text-red-600 text-left mb-4">
                                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </p>
                        )}

                        {notice && (
                            <p className="flex items-start gap-1.5 text-sm text-green-600 text-left mb-4">
                                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                                <span>{notice}</span>
                            </p>
                        )}

                        <button
                            onClick={handleCheck}
                            disabled={checking}
                            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                            {checking && <Loader2 size={16} className="animate-spin" />}
                            {checking ? "Checking..." : "I've verified — continue"}
                        </button>

                        <p className="text-sm text-muted mt-6">
                            Didn&apos;t get it?{" "}
                            <button
                                onClick={handleResend}
                                disabled={cooldown > 0 || sending}
                                className="text-[var(--primary)] hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed"
                            >
                                {sending
                                    ? "Sending..."
                                    : cooldown > 0
                                        ? `Resend in ${cooldown}s`
                                        : "Resend the email"}
                            </button>
                        </p>

                        <p className="text-xs text-muted mt-4">
                            You can keep using PDFAI in the meantime.{" "}
                            <Link href="/dashboard" className="text-[var(--primary)] hover:underline">
                                Skip for now
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
