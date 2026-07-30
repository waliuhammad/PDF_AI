"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Star,
    FileText,
    Brain,
    Upload,
} from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden py-16 lg:py-20">

            {/* Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">

                <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

                <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

            </div>

            <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">

                {/* LEFT */}

                <motion.div
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .6 }}
                >

                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">

                        <Sparkles size={16} />

                        AI Powered PDF Workspace

                    </div>

                    <h1 className="mt-6 text-5xl font-bold leading-tight text-fg lg:text-6xl">

                        Work smarter
                        <br />

                        with your

                        <span className="text-primary"> PDF files</span>

                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-muted">

                        Convert, edit, merge, compress, summarise and chat with PDFs
                        using intelligent AI tools. Fast, secure and built for modern
                        professionals.

                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">

                        <Link
                            href="#tools"
                            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
                        >

                            Start Free

                            <ArrowRight size={18} />

                        </Link>

                        <Link
                            href="#pricing"
                            className="rounded-xl border border-border px-6 py-3 font-semibold transition hover:border-primary hover:text-primary"
                        >
                            View Pricing
                        </Link>

                    </div>

                    {/* Trust */}

                    <div className="mt-10 flex flex-wrap gap-6">

                        <div className="flex items-center gap-2">

                            <Star
                                className="text-yellow-500"
                                fill="currentColor"
                                size={18}
                            />

                            <span className="text-sm text-muted">

                                5.0 Rating

                            </span>

                        </div>

                        <div className="flex items-center gap-2">

                            <ShieldCheck
                                size={18}
                                className="text-green-500"
                            />

                            <span className="text-sm text-muted">

                                Secure Processing

                            </span>

                        </div>

                        <div className="flex items-center gap-2">

                            <FileText
                                size={18}
                                className="text-primary"
                            />

                            <span className="text-sm text-muted">

                                10M+ PDFs Processed

                            </span>

                        </div>

                    </div>

                </motion.div>

                {/* RIGHT */}

                <motion.div
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .7 }}
                    className="relative"
                >

                    {/* Upload Card */}

                    <motion.div

                        animate={{
                            y: [0, -8, 0]
                        }}

                        transition={{
                            repeat: Infinity,
                            duration: 5
                        }}

                        className="rounded-3xl border border-border bg-card p-6 shadow-xl"

                    >

                        <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-primary/10 p-3">

                                <Upload className="text-primary" />

                            </div>

                            <div>

                                <h3 className="font-semibold">

                                    Upload PDF

                                </h3>

                                <p className="text-sm text-muted">

                                    Drag & Drop or Browse

                                </p>

                            </div>

                        </div>

                        <div className="mt-6 h-3 rounded-full bg-muted">

                            <div className="h-3 w-3/4 rounded-full bg-primary" />

                        </div>

                    </motion.div>

                    {/* AI Summary */}

                    <motion.div

                        animate={{
                            y: [0, 10, 0]
                        }}

                        transition={{
                            repeat: Infinity,
                            duration: 6
                        }}

                        className="absolute -left-10 top-44 w-64 rounded-3xl border border-border bg-card p-5 shadow-xl"

                    >

                        <div className="flex items-center gap-2">

                            <Brain
                                className="text-primary"
                                size={22}
                            />

                            <h4 className="font-semibold">

                                AI Summary

                            </h4>

                        </div>

                        <p className="mt-4 text-sm leading-6 text-muted">

                            • 15 pages analysed

                            <br />

                            • Key insights extracted

                            <br />

                            • Ready in 4 seconds

                        </p>

                    </motion.div>

                    {/* PDF Card */}

                    <motion.div

                        animate={{
                            y: [0, -10, 0]
                        }}

                        transition={{
                            repeat: Infinity,
                            duration: 7
                        }}

                        className="absolute -right-6 bottom-0 w-56 rounded-3xl border border-border bg-card p-5 shadow-xl"

                    >

                        <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-primary/10 p-3">

                                <FileText
                                    className="text-primary"
                                    size={22}
                                />

                            </div>

                            <div>

                                <p className="font-semibold">

                                    report.pdf

                                </p>

                                <p className="text-xs text-muted">

                                    Ready to download

                                </p>

                            </div>

                        </div>

                    </motion.div>

                </motion.div>

            </div>

        </section>
    );
}