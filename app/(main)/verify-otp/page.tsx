"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { FileText } from "lucide-react";

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Backend integration comes later
    };

    const isComplete = otp.every((digit) => digit !== "");

    return (
        <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--background-secondary)]">
            <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-card shadow-sm text-center">
                <Link href="/" className="flex items-center justify-center gap-2 text-xl font-bold text-fg mb-8">
                    <FileText className="text-[var(--primary)]" size={22} />
                    PDF<span className="text-[var(--primary)]">AI</span>
                </Link>

                <h1 className="text-2xl font-bold text-fg mb-2">Verify your email</h1>
                <p className="text-muted text-sm mb-8">
                    Enter the 6-digit code we sent to your email address
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-card text-fg bg-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!isComplete}
                        className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                    >
                        Verify Code
                    </button>
                </form>

                <p className="text-sm text-muted mt-6">
                    Didn't receive a code?{" "}
                    <button className="text-[var(--primary)] hover:underline">Resend</button>
                </p>
            </div>
        </main>
    );
}