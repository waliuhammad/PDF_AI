"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, FileText } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Backend integration comes later
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--background-secondary)]">
            <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-card shadow-sm">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-fg mb-8">
                    <FileText className="text-[var(--primary)]" size={22} />
                    PDF<span className="text-[var(--primary)]">AI</span>
                </Link>

                <h1 className="text-2xl font-bold text-fg mb-2">Welcome back</h1>
                <p className="text-muted text-sm mb-8">Log in to continue to your account</p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm text-fg">Password</label>
                            <Link href="/forget-password" className="text-xs text-[var(--primary)] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
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

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-center text-sm text-muted mt-6">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-[var(--primary)] hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}