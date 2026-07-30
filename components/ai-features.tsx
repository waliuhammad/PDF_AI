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
        description:
            "Ask questions about any PDF and receive accurate answers instantly.",
        icon: MessageSquare,
        badge: "AI",
    },
    {
        title: "AI Summary",
        description:
            "Generate concise summaries from lengthy reports, books and documents.",
        icon: Sparkles,
        badge: "Popular",
    },
    {
        title: "OCR Scanner",
        description:
            "Convert scanned PDFs and images into fully editable searchable text.",
        icon: ScanText,
        badge: "OCR",
    },
    {
        title: "Translate PDF",
        description:
            "Translate documents into multiple languages while preserving formatting.",
        icon: Languages,
        badge: "New",
    },
    {
        title: "Extract Tables",
        description:
            "Extract tables directly into Excel with intelligent formatting.",
        icon: Table2,
        badge: "Smart",
    },
    {
        title: "AI Insights",
        description:
            "Automatically identify important information and document highlights.",
        icon: BrainCircuit,
        badge: "Pro",
    },
];

export function AIFeatures() {
    return (
        <section className="relative overflow-hidden py-24 px-6">

            {/* Background */}

            <div className="absolute inset-0 bg-[var(--background-secondary)]" />

            <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

            <div className="relative mx-auto max-w-7xl">

                {/* Heading */}

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-medium text-primary">
                        <Sparkles size={16} />
                        AI Powered Features
                    </span>

                    <h2 className="mt-6 text-4xl font-bold text-fg md:text-5xl">
                        Supercharge your PDFs with AI
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
                        Save hours with intelligent document analysis, summaries,
                        translations and AI-powered conversations.
                    </p>
                </motion.div>

                {/* Cards */}

                <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                }}
                                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  bg-card
                  p-8
                  shadow-sm
                  transition-all
                  hover:border-primary/40
                  hover:shadow-2xl
                "
                            >
                                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />

                                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    {feature.badge}
                                </span>

                                <div className="relative mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition group-hover:scale-110">
                                    <Icon className="h-8 w-8 text-primary" />
                                </div>

                                <h3 className="mt-6 text-2xl font-semibold text-fg">
                                    {feature.title}
                                </h3>

                                <p className="mt-4 leading-7 text-muted">
                                    {feature.description}
                                </p>

                                <div className="mt-8 flex items-center gap-2 font-medium text-primary transition group-hover:gap-3">
                                    Learn More
                                    <ArrowRight size={18} />
                                </div>
                            </motion.div>
                        );
                    })}

                </div>

                {/* Bottom CTA */}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <Link
                        href="/ai-tools"
                        className="
              inline-flex
              items-center
              gap-2
              rounded-2xl
              bg-primary
              px-7
              py-4
              font-semibold
              text-primary-foreground
              transition
              hover:opacity-90
            "
                    >
                        Explore AI Tools

                        <ArrowRight size={18} />
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}