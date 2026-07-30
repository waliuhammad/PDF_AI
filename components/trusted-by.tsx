"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
    SiGoogle,
    SiNotion,
    SiGithub,
    SiZoom,
    SiAtlassian,
    SiFigma,
} from "react-icons/si";

interface Company {
    name: string;
    icon: IconType;
}

const companies: Company[] = [
    { name: "Google", icon: SiGoogle },
    { name: "GitHub", icon: SiGithub },
    { name: "Figma", icon: SiFigma },

    { name: "Notion", icon: SiNotion },

    { name: "Zoom", icon: SiZoom },
    { name: "Atlassian", icon: SiAtlassian },
];

export function TrustedBy() {
    return (
        <section className="border-y border-border/50 bg-background py-12">
            <div className="mx-auto max-w-7xl px-6">

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                        Trusted Worldwide
                    </span>

                    <h2 className="mt-4 text-2xl font-bold text-fg md:text-3xl">
                        Trusted by teams across the world
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-muted">
                        Professionals, startups and enterprises rely on PDF AI every day
                        to manage millions of documents securely.
                    </p>
                </motion.div>

                {/* Company Logos */}
                <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {companies.map((company, index) => {
                        const Icon = company.icon;

                        return (
                            <motion.div
                                key={company.name}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4, scale: 1.03 }}
                                className="group flex h-20 items-center justify-center rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
                            >
                                <Icon
                                    size={34}
                                    className="text-muted transition-colors duration-300 group-hover:text-primary"
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="mt-10 grid gap-6 rounded-3xl border border-border bg-card p-6 md:grid-cols-3">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-primary">50K+</h3>
                        <p className="mt-1 text-sm text-muted">
                            Active Users
                        </p>
                    </div>

                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-primary">10M+</h3>
                        <p className="mt-1 text-sm text-muted">
                            PDFs Processed
                        </p>
                    </div>

                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-primary">150+</h3>
                        <p className="mt-1 text-sm text-muted">
                            Countries Served
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}