"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { submitContactMessage } from "@/lib/firebase/contact";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const isValid =
        name.trim() !== "" && /^\S+@\S+\.\S+$/.test(email) && message.trim() !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setSubmitting(true);
        setError(null);

        try {
            await submitContactMessage({ name, email, subject, message });
            setSent(true);
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
        } catch (err) {
            const denied =
                err instanceof Error && err.message.includes("insufficient permissions");
            setError(
                denied
                    ? "Messages can't be received yet — the database rules still need publishing."
                    : "Couldn't send that just now. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (sent) {
        return (
            <div className="max-w-xl rounded-2xl border border-card bg-card p-6">
                <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-fg">Thanks — your message is with us.</p>
                        <p className="text-sm text-muted mt-1">
                            We&apos;ll reply to the email address you gave.
                        </p>
                        <button
                            onClick={() => setSent(false)}
                            className="mt-4 text-sm text-[var(--primary)] hover:underline"
                        >
                            Send another message
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const inputClass =
        "w-full px-4 py-2.5 rounded-xl border border-card bg-card text-fg placeholder:text-muted text-sm focus:outline-none focus:border-[var(--primary)] transition-colors";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-fg mb-1.5">
                        Your name
                    </label>
                    <input
                        id="name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(null); }}
                        className={inputClass}
                        autoComplete="name"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-fg mb-1.5">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        className={inputClass}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-fg mb-1.5">
                    Subject <span className="text-muted font-normal">(optional)</span>
                </label>
                <input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-fg mb-1.5">
                    Message
                </label>
                <textarea
                    id="message"
                    rows={6}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError(null); }}
                    className={`${inputClass} resize-y`}
                />
            </div>

            {error && (
                <p className="flex items-start gap-1.5 text-sm text-red-600">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </p>
            )}

            <button
                type="submit"
                disabled={!isValid || submitting}
                className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Sending..." : "Send Message"}
            </button>
        </form>
    );
}
