"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, FileText, Phone } from "lucide-react";
import { registerWithEmail, signInWithSocial, type SocialProviderId } from "@/lib/firebase/auth";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { SocialAuth } from "@/components/auth/social-auth";
import { TermsAgreement } from "@/components/auth/terms-agreement";

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dialCode, setDialCode] = useState(COUNTRY_CODES[0].dialCode);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await registerWithEmail({ fullName: name, email, password, phoneDialCode: dialCode, phoneNumber });
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocial = async (provider: SocialProviderId) => {
        if (!agreed) {
            setError("Please accept the Terms of Service and Privacy Policy to continue.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await signInWithSocial(provider);
            router.push("/dashboard");
        } catch (err) {
            const code = (err as { code?: string })?.code;
            if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
                setError(null);
            } else if (code === "auth/operation-not-allowed") {
                setError("That sign-up method isn't enabled for this app yet.");
            } else {
                setError(err instanceof Error ? err.message : "Sign-up failed. Please try again.");
            }
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
                <p className="text-muted text-sm mb-6 sm:mb-8">Start using every PDF tool for free</p>

                {error && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-[var(--primary)] text-xs">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-fg mb-1 block">Full name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-fg mb-1 block">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-fg mb-1 block">Phone number</label>
                        <div className="flex gap-2">
                            <select
                                value={dialCode}
                                onChange={(e) => setDialCode(e.target.value)}
                                className="w-24 sm:w-28 shrink-0 py-3 px-2 rounded-xl bg-card border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                            >
                                {COUNTRY_CODES.map((c) => (
                                    <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                                        {c.dialCode} {c.code}
                                    </option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                                    placeholder="300 1234567"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-fg mb-1 block">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <TermsAgreement checked={agreed} onChange={setAgreed} id="register-terms" />

                    <button
                        type="submit"
                        disabled={loading || !agreed}
                        className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <SocialAuth action="Sign up" disabled={loading} onSelect={handleSocial} />

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