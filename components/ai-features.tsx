import Link from "next/link";
import { Reveal } from "@/components/reveal";
import {
    Sparkles,
    ScanText,
    Languages,
    Table2,
    MessageSquare,
    ArrowRight,
} from "lucide-react";

const features = [
    {
        title: "Chat with PDF",
        description: "Ask questions about any PDF and receive accurate answers instantly.",
        icon: MessageSquare,
        badge: "AI",
        slug: "chatai-info",
    },
    {
        title: "AI Summary",
        description: "Generate concise summaries from lengthy reports, books and documents.",
        icon: Sparkles,
        badge: "Popular",
        slug: "aisummary-info",
    },
    {
        title: "OCR PDF",
        description: "Convert scanned PDFs and images into fully editable searchable text.",
        icon: ScanText,
        badge: "OCR",
        slug: "ocrscanner-info",
    },
    {
        title: "Translate PDF",
        description: "Translate documents into multiple languages while preserving formatting.",
        icon: Languages,
        badge: "New",
        slug: "aitranslate-info",
    },
    {
        title: "Grammar Checker",
        description: "Check grammar and spelling of your document.",
        icon: Table2,
        badge: "Smart",
        slug: "aigrammar-info",
    },
];

export function AIFeatures() {
    return (
        <section className="relative overflow-hidden py-10 sm:py-16 px-4 sm:px-6">
            <div className="absolute inset-0 bg-background" />
            <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

            <div className="relative mx-auto max-w-7xl">
                <Reveal>
                    <div className="text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                            <Sparkles size={14} />
                            AI Powered Features
                        </span>

                        <h2 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-foreground md:text-4xl">
                            Supercharge your PDFs with AI
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                            Save hours with intelligent document analysis, summaries, translations and AI-powered conversations.
                        </p>
                    </div>
                </Reveal>

                {/* Pricing / Feature Cards Layout Fix: Same card size for mobile, bold/larger text */}
                <div className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <Link key={feature.title} href={`/${feature.slug}`} className="block h-full">
                                <Reveal delay={index * 50} className="h-full">
                                    <div className="group
                                        relative
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-border
                                        bg-card
                                        p-5 sm:p-5
                                        shadow-sm
                                        transition-all
                                        hover:border-primary/40
                                        hover:shadow-xl
                                        flex h-full flex-col duration-200 hover:-translate-y-1.5 hover:scale-[1.01]">
                                        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

                                        <div className="flex items-center justify-between">
                                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 transition group-hover:scale-105">
                                                <Icon className="h-5 w-5 text-primary sm:h-5 sm:w-5" />
                                            </div>

                                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                {feature.badge}
                                            </span>
                                        </div>

                                        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold sm:font-semibold text-foreground">
                                            {feature.title}
                                        </h3>

                                        <p className="mt-1.5 sm:mt-2 text-sm sm:text-sm font-medium sm:font-normal leading-relaxed text-muted-foreground line-clamp-2">
                                            {feature.description}
                                        </p>

                                        <div className="mt-auto flex items-center gap-1.5 pt-3 sm:pt-4 text-sm font-semibold sm:font-medium text-primary transition group-hover:gap-2">
                                            <span>Learn More</span>
                                            <ArrowRight size={16} className="sm:w-4 sm:h-4" />
                                        </div>
                                    </div>
                                </Reveal>
                            </Link>
                        );
                    })}
                </div>

                <Reveal>
                    <div className="mt-6 sm:mt-10 text-center">
                        <Link
                            href="/tools?category=AI%20Tools"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-indigo-600
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:opacity-90
                            "
                        >
                            Explore AI Tools
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}