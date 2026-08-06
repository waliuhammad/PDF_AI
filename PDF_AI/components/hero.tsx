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
        <section className="relative overflow-hidden py-14 lg:py-20">

            {/* Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">

                {/* LEFT */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .6 }}
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                        <Sparkles size={14} />
                        AI Powered PDF Workspace
                    </div>

                    <h1 className="mt-5 text-4xl font-bold leading-tight text-fg lg:text-5xl">
                        Work smarter
                        <br />
                        with your
                        <span className="text-primary"> PDF files</span>
                    </h1>

                    <p className="mt-4 max-w-lg text-base leading-7 text-muted">
                        Convert, edit, merge, compress, summarise and chat with PDFs
                        using intelligent AI tools. Fast, secure and built for modern
                        professionals.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3.5">
                        <Link
                            href="#tools"
                            className="
                                flex
                                items-center
                                gap-2
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-fg
                                transition
                                relative
                                after:absolute
                                after:bottom-1
                                after:left-6
                                after:right-6
                                after:h-0.5
                                after:bg-indigo-600
                                after:scale-x-0
                                after:transition-transform
                                hover:after:scale-x-100
                            "
                        >
                            Start Free
                            <ArrowRight size={17} />
                        </Link>

                        <Link
                            href="#pricing"
                            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                        >
                            View Pricing
                        </Link>
                    </div>

                    {/* Trust */}
                    <div className="mt-8 flex flex-wrap gap-5">
                        <div className="flex items-center gap-1.5">
                            <Star
                                className="text-yellow-500"
                                fill="currentColor"
                                size={16}
                            />
                            <span className="text-xs text-muted">
                                5.0 Rating
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <ShieldCheck
                                size={16}
                                className="text-green-500"
                            />
                            <span className="text-xs text-muted">
                                Secure Processing
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <FileText
                                size={16}
                                className="text-primary"
                            />
                            <span className="text-xs text-muted">
                                10M+ PDFs Processed
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .7 }}
                    className="relative pt-2 pb-16"
                >

                    {/* Upload Card */}
                    <motion.div
                        animate={{
                            y: [0, -6, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 5
                        }}
                        className="rounded-2xl border border-border bg-card p-5 shadow-xl max-w-sm ml-auto mr-4"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-primary/10 p-2.5">
                                <Upload className="text-primary" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">
                                    Upload PDF
                                </h3>
                                <p className="text-xs text-muted">
                                    Drag & Drop or Browse
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 h-2.5 rounded-full bg-muted">
                            <div className="h-2.5 w-3/4 rounded-full bg-primary" />
                        </div>
                    </motion.div>

                    {/* AI Summary */}
                    <motion.div
                        animate={{
                            y: [0, 8, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 6
                        }}
                        className="absolute left-2 top-20 w-56 rounded-2xl border border-border bg-card p-4 shadow-xl z-10"
                    >
                        <div className="flex items-center gap-2">
                            <Brain
                                className="text-primary"
                                size={18}
                            />
                            <h4 className="font-semibold text-sm">
                                AI Summary
                            </h4>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-muted">
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
                            y: [0, -8, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 7
                        }}
                        className="absolute right-2 top-28 w-48 rounded-2xl border border-border bg-card p-4 shadow-xl z-10"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-primary/10 p-2.5">
                                <FileText
                                    className="text-primary"
                                    size={18}
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">
                                    report.pdf
                                </p>
                                <p className="text-[11px] text-muted">
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
