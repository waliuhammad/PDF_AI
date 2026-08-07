"use client";

import { Reveal } from "@/components/reveal";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Ahmed",
        role: "Product Designer",
        company: "Adobe",
        image: "https://i.pravatar.cc/150?img=32",
        review:
            "PDF AI completely transformed the way I work with documents. The AI summary saves me hours every week.",
    },
    {
        name: "James Walker",
        role: "Project Manager",
        company: "Microsoft",
        image: "https://i.pravatar.cc/150?img=12",
        review:
            "Fast, reliable and incredibly easy to use. OCR and PDF conversion are the best I've tried.",
    },
    {
        name: "Emily Carter",
        role: "Marketing Lead",
        company: "Spotify",
        image: "https://i.pravatar.cc/150?img=47",
        review:
            "Our team processes hundreds of PDFs every month. PDF AI made the workflow effortless.",
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="relative overflow-hidden px-6 py-16 bg-[var(--background-secondary)]">

            {/* Background Glow */}
            <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Header */}

                <div className="text-center">

                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-medium">

                        ⭐ Trusted Worldwide

                    </div>

                    <h2 className="mt-3 text-3xl font-bold text-fg">

                        Loved by thousands of professionals

                    </h2>

                    <p className="mt-2 text-sm text-muted max-w-xl mx-auto">

                        Join over 50,000 users who rely on PDF AI every day.

                    </p>

                </div>

                {/* Trust Stats */}

                <div className="mt-8 grid grid-cols-3 gap-6 text-center max-w-3xl mx-auto">

                    <div>

                        <h3 className="text-2xl font-bold text-primary">50K+</h3>

                        <p className="text-xs text-muted mt-1">Active Users</p>

                    </div>

                    <div>

                        <h3 className="text-2xl font-bold text-primary">5.0★</h3>

                        <p className="text-xs text-muted mt-1">Average Rating</p>

                    </div>

                    <div>

                        <h3 className="text-2xl font-bold text-primary">150+</h3>

                        <p className="text-xs text-muted mt-1">Countries</p>

                    </div>

                </div>

                {/* Cards */}

                <div className="mt-10 grid gap-6 md:grid-cols-3">

                    {testimonials.map((item, index) => (

                        <Reveal key={item.name} delay={index * 100}>
                            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-lg hover:border-primary/40 transition-all h-full duration-200 hover:-translate-y-1.5 hover:scale-[1.01]">

                            <Quote
                                className="absolute right-5 top-5 text-primary/20"
                                size={32}
                            />

                            <div className="flex items-center gap-3.5">

                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                />

                                <div>

                                    <h4 className="font-semibold text-sm text-fg">
                                        {item.name}
                                    </h4>

                                    <p className="text-xs text-muted">
                                        {item.role}
                                    </p>

                                    <p className="text-[11px] text-primary font-medium">
                                        {item.company}
                                    </p>

                                </div>

                            </div>

                            <div className="mt-4 flex text-yellow-500">

                                {[1, 2, 3, 4, 5].map((star) => (

                                    <Star
                                        key={star}
                                        size={15}
                                        fill="currentColor"
                                    />

                                ))}

                            </div>

                            <p className="mt-4 text-xs leading-relaxed text-muted">

                                "{item.review}"

                            </p>

                        </div>
                        </Reveal>

                    ))}

                </div>

            </div>

        </section>
    );
}
