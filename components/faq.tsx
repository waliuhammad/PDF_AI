"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    category: string;
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        category: "General",
        question: "What is PDF AI?",
        answer:
            "PDF AI is an all-in-one platform for converting, editing and analysing PDF documents.",
    },
    {
        category: "AI",
        question: "How does AI PDF Summary work?",
        answer:
            "Our AI reads your document and generates concise summaries, key insights and important takeaways in seconds.",
    },
    {
        category: "Security",
        question: "Are my files secure?",
        answer:
            "Yes. All uploaded files are encrypted during transfer and processing. Files are automatically removed after processing.",
    },
    {
        category: "Pricing",
        question: "Can I use PDF AI for free?",
        answer:
            "Yes. Our Free plan includes essential PDF tools, while Pro and Business unlock premium AI features.",
    },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(0);

    return (
      <section id="faq" className="px-6 py-16 bg-[var(--background-secondary)]">
            <div className="mx-auto max-w-3xl">
                <div className="text-center mb-10">
                    <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                        Frequently Asked Questions
                    </span>

                    <h2 className="mt-3 text-3xl font-bold text-fg">
                        Everything you need to know
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                        Can't find your answer? Contact our support team anytime.
                    </p>
                </div>

                <div className="space-y-3.5">
                    {faqs.map((faq: FAQItem, index: number) => (
                        <motion.div
                            key={faq.question}
                            layout
                            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
                        >
                            <button
                                onClick={() => setOpen(open === index ? null : index)}
                                className="flex w-full items-center justify-between p-5 text-left"
                            >
                                <div>
                                    <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                                        {faq.category}
                                    </span>

                                    <h3 className="mt-1 text-base font-semibold text-fg">
                                        {faq.question}
                                    </h3>
                                </div>

                                <motion.div
                                    animate={{ rotate: open === index ? 180 : 0 }}
                                    className="text-muted shrink-0 ml-4"
                                >
                                    <ChevronDown size={18} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {open === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="border-t border-border px-5 pb-5 pt-3 text-xs leading-relaxed text-muted">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
