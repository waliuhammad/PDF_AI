"use client";

import { motion } from "framer-motion";
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
<<<<<<< HEAD
        <section className="relative overflow-hidden px-6 py-16 bg-[var(--background-secondary)]">

            {/* Background Glow */}
            <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
=======
        <section className="relative overflow-hidden px-6 py-24 bg-[var(--background-secondary)]">

            {/* Background Glow */}
            <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
>>>>>>> origin/main

            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Header */}

                <div className="text-center">

<<<<<<< HEAD
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-medium">
=======
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-primary text-sm font-medium">
>>>>>>> origin/main

                        ⭐ Trusted Worldwide

                    </div>

<<<<<<< HEAD
                    <h2 className="mt-3 text-3xl font-bold text-fg">
=======
                    <h2 className="mt-6 text-4xl font-bold text-fg">
>>>>>>> origin/main

                        Loved by thousands of professionals

                    </h2>

<<<<<<< HEAD
                    <p className="mt-2 text-sm text-muted max-w-xl mx-auto">
=======
                    <p className="mt-4 text-muted max-w-2xl mx-auto">
>>>>>>> origin/main

                        Join over 50,000 users who rely on PDF AI every day.

                    </p>

                </div>

                {/* Trust Stats */}

<<<<<<< HEAD
                <div className="mt-8 grid grid-cols-3 gap-6 text-center max-w-3xl mx-auto">

                    <div>

                        <h3 className="text-2xl font-bold text-primary">50K+</h3>

                        <p className="text-xs text-muted mt-1">Active Users</p>
=======
                <div className="mt-12 grid grid-cols-3 gap-6 text-center">

                    <div>

                        <h3 className="text-3xl font-bold text-primary">50K+</h3>

                        <p className="text-muted mt-2">Active Users</p>
>>>>>>> origin/main

                    </div>

                    <div>

<<<<<<< HEAD
                        <h3 className="text-2xl font-bold text-primary">5.0★</h3>

                        <p className="text-xs text-muted mt-1">Average Rating</p>
=======
                        <h3 className="text-3xl font-bold text-primary">5.0★</h3>

                        <p className="text-muted mt-2">Average Rating</p>
>>>>>>> origin/main

                    </div>

                    <div>

<<<<<<< HEAD
                        <h3 className="text-2xl font-bold text-primary">150+</h3>

                        <p className="text-xs text-muted mt-1">Countries</p>
=======
                        <h3 className="text-3xl font-bold text-primary">150+</h3>

                        <p className="text-muted mt-2">Countries</p>
>>>>>>> origin/main

                    </div>

                </div>

                {/* Cards */}

<<<<<<< HEAD
                <div className="mt-10 grid gap-6 md:grid-cols-3">
=======
                <div className="mt-16 grid gap-8 md:grid-cols-3">
>>>>>>> origin/main

                    {testimonials.map((item, index) => (

                        <motion.div
                            key={item.name}
<<<<<<< HEAD
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative rounded-2xl border border-border bg-card p-6 shadow-lg hover:border-primary/40 transition-all"
                        >

                            <Quote
                                className="absolute right-5 top-5 text-primary/20"
                                size={32}
                            />

                            <div className="flex items-center gap-3.5">
=======
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="relative rounded-3xl border border-border bg-card p-8 shadow-lg hover:border-primary/40 transition-all"
                        >

                            <Quote
                                className="absolute right-6 top-6 text-primary/20"
                                size={40}
                            />

                            <div className="flex items-center gap-4">
>>>>>>> origin/main

                                <img
                                    src={item.image}
                                    alt={item.name}
<<<<<<< HEAD
                                    className="h-12 w-12 rounded-full object-cover"
=======
                                    className="h-14 w-14 rounded-full object-cover"
>>>>>>> origin/main
                                />

                                <div>

<<<<<<< HEAD
                                    <h4 className="font-semibold text-sm text-fg">
                                        {item.name}
                                    </h4>

                                    <p className="text-xs text-muted">
                                        {item.role}
                                    </p>

                                    <p className="text-[11px] text-primary font-medium">
=======
                                    <h4 className="font-semibold text-fg">
                                        {item.name}
                                    </h4>

                                    <p className="text-sm text-muted">
                                        {item.role}
                                    </p>

                                    <p className="text-xs text-primary">
>>>>>>> origin/main
                                        {item.company}
                                    </p>

                                </div>

                            </div>

<<<<<<< HEAD
                            <div className="mt-4 flex text-yellow-500">
=======
                            <div className="mt-6 flex text-yellow-500">
>>>>>>> origin/main

                                {[1, 2, 3, 4, 5].map((star) => (

                                    <Star
                                        key={star}
<<<<<<< HEAD
                                        size={15}
=======
                                        size={18}
>>>>>>> origin/main
                                        fill="currentColor"
                                    />

                                ))}

                            </div>

<<<<<<< HEAD
                            <p className="mt-4 text-xs leading-relaxed text-muted">
=======
                            <p className="mt-6 leading-7 text-muted">
>>>>>>> origin/main

                                "{item.review}"

                            </p>

                        </motion.div>

                    ))}

                </div>

            </div>

        </section>
    );
}