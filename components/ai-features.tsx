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
<<<<<<< HEAD
        description: "Ask questions about any PDF and receive accurate answers instantly.",
=======
        description:
            "Ask questions about any PDF and receive accurate answers instantly.",
>>>>>>> origin/main
        icon: MessageSquare,
        badge: "AI",
    },
    {
        title: "AI Summary",
<<<<<<< HEAD
        description: "Generate concise summaries from lengthy reports, books and documents.",
=======
        description:
            "Generate concise summaries from lengthy reports, books and documents.",
>>>>>>> origin/main
        icon: Sparkles,
        badge: "Popular",
    },
    {
        title: "OCR Scanner",
<<<<<<< HEAD
        description: "Convert scanned PDFs and images into fully editable searchable text.",
=======
        description:
            "Convert scanned PDFs and images into fully editable searchable text.",
>>>>>>> origin/main
        icon: ScanText,
        badge: "OCR",
    },
    {
        title: "Translate PDF",
<<<<<<< HEAD
        description: "Translate documents into multiple languages while preserving formatting.",
=======
        description:
            "Translate documents into multiple languages while preserving formatting.",
>>>>>>> origin/main
        icon: Languages,
        badge: "New",
    },
    {
        title: "Extract Tables",
<<<<<<< HEAD
        description: "Extract tables directly into Excel with intelligent formatting.",
=======
        description:
            "Extract tables directly into Excel with intelligent formatting.",
>>>>>>> origin/main
        icon: Table2,
        badge: "Smart",
    },
    {
        title: "AI Insights",
<<<<<<< HEAD
        description: "Automatically identify important information and document highlights.",
=======
        description:
            "Automatically identify important information and document highlights.",
>>>>>>> origin/main
        icon: BrainCircuit,
        badge: "Pro",
    },
];

export function AIFeatures() {
    return (
<<<<<<< HEAD
        <section className="relative overflow-hidden py-16 px-6">
=======
        <section className="relative overflow-hidden py-24 px-6">
>>>>>>> origin/main

            {/* Background */}

            <div className="absolute inset-0 bg-[var(--background-secondary)]" />

<<<<<<< HEAD
            <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
=======
            <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
>>>>>>> origin/main

            <div className="relative mx-auto max-w-7xl">

                {/* Heading */}

                <motion.div
<<<<<<< HEAD
                    initial={{ opacity: 0, y: 20 }}
=======
                    initial={{ opacity: 0, y: 30 }}
>>>>>>> origin/main
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
<<<<<<< HEAD
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                        <Sparkles size={14} />
                        AI Powered Features
                    </span>

                    <h2 className="mt-4 text-3xl font-bold text-fg md:text-4xl">
                        Supercharge your PDFs with AI
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-base text-muted">
                        Save hours with intelligent document analysis, summaries, translations and AI-powered conversations.
=======
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
>>>>>>> origin/main
                    </p>
                </motion.div>

                {/* Cards */}

<<<<<<< HEAD
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
=======
                <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
>>>>>>> origin/main

                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={feature.title}
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
                    className="mt-10 text-center"
=======
                    className="mt-16 text-center"
>>>>>>> origin/main
                >
                    <Link
                        href="/ai-tools"
                        className="
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}