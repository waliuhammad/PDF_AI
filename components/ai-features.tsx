"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    BrainCircuit,
    Sparkles,
    ScanText,
    Languages,
    Table2,
    MessageSquare,
    ArrowRight,
} from "lucide-react";

const features = [
    {
        title: "AI Chat",
        href: "/chats",
        description: "Ask questions about any PDF and receive accurate answers instantly.",
        icon: MessageSquare,
        badge: "AI",
    },
    {
        title: "AI Summary",
        href: "/summarize-pdf",
        description: "Generate concise summaries from lengthy reports, books and documents.",
        icon: Sparkles,
        badge: "Popular",
    },
    {
        title: "OCR Scanner",
        href: "/ocr",
        description: "Convert scanned PDFs and images into fully editable searchable text.",
        icon: ScanText,
        badge: "OCR",
    },
    {
        title: "Translate PDF",
        href: "/translate-pdf",
        description: "Translate documents into multiple languages while preserving formatting.",
        icon: Languages,
        badge: "New",
    },
    {
        title: "Extract Tables",
        href: "/pdf-to-excel",
        description: "Extract tables directly into Excel with intelligent formatting.",
        icon: Table2,
        badge: "Smart",
    },
    {
        title: "AI Insights",
        href: "/ai-insights",
        description: "Automatically identify important information and document highlights.",
        icon: BrainCircuit,
        badge: "Pro",
    },
];

export function AIFeatures() {
    return (
        <section className="relative overflow-hidden py-16 px-6">

            {/* Background */}

            <div className="absolute inset-0 bg-[var(--background-secondary)]" />

            <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

            <div className="relative mx-auto max-w-7xl">

                {/* Heading */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                        <Sparkles size={14} />
                        AI Powered Features
                    </span>

                    <h2 className="mt-4 text-3xl font-bold text-fg md:text-4xl">
                        Supercharge your PDFs with AI
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-base text-muted">
                        Save hours with intelligent document analysis, summaries, translations and AI-powered conversations.
                    </p>
                </motion.div>

                {/* Cards */}

                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <Link key={feature.title} href={feature.href} className="block h-full">
                            <motion.div

                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{
                                    y: -4,
                                    scale: 1.01,
                                }}
                                className="
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-border
                                    bg-card
                                    p-5
                                    shadow-sm
                                    transition-all
                                    hover:border-primary/40
                                    hover:shadow-xl
                                "
                            >
                                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition group-hover:scale-105">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>

                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                        {feature.badge}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-lg font-semibold text-fg">
                                    {feature.title}
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                                    {feature.description}
                                </p>

                                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary transition group-hover:gap-2">
                                    <span>Learn More</span>
                                    <ArrowRight size={16} />
                                </div>
                            </motion.div>
                            </Link>
                        );
                    })}

                </div>

                {/* Bottom CTA */}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-10 text-center"
                >
                    <Link
                        href="/tools?category=AI%20Tools"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-primary
                            px-6
                            py-3
                            text-sm
                            font-semibold
                            text-primary-foreground
                            transition
                            hover:opacity-90
                        "
                    >
                        Explore AI Tools
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
