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
<<<<<<< HEAD
    iconColor: string;
    renderName: () => React.ReactNode;
}

const companies: Company[] = [
    {
        name: "Google",
        icon: SiGoogle,
        iconColor: "text-[#4285F4]",
        renderName: () => (
            <span className="tracking-tight font-semibold">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
            </span>
        ),
    },
    {
        name: "GitHub",
        icon: SiGithub,
        iconColor: "text-foreground",
        renderName: () => (
            <span className="tracking-tight font-semibold text-foreground">
                GitHub
            </span>
        ),
    },
    {
        name: "Figma",
        icon: SiFigma,
        iconColor: "text-[#F24E1E]",
        renderName: () => (
            <span className="tracking-tight font-semibold text-foreground">
                Figma
            </span>
        ),
    },
    {
        name: "Notion",
        icon: SiNotion,
        iconColor: "text-foreground",
        renderName: () => (
            <span className="tracking-tight font-semibold text-foreground">
                Notion
            </span>
        ),
    },
    {
        name: "Zoom",
        icon: SiZoom,
        iconColor: "text-[#2D8CFF]",
        renderName: () => (
            <span className="tracking-tight font-semibold text-[#2D8CFF]">
                zoom
            </span>
        ),
    },
    {
        name: "Atlassian",
        icon: SiAtlassian,
        iconColor: "text-[#0052CC]",
        renderName: () => (
            <span className="tracking-tight font-semibold text-[#0052CC]">
                ATLASSIAN
            </span>
        ),
    },
=======
}

const companies: Company[] = [
    { name: "Google", icon: SiGoogle },
    { name: "GitHub", icon: SiGithub },
    { name: "Figma", icon: SiFigma },

    { name: "Notion", icon: SiNotion },

    { name: "Zoom", icon: SiZoom },
    { name: "Atlassian", icon: SiAtlassian },
>>>>>>> origin/main
];

export function TrustedBy() {
    return (
<<<<<<< HEAD
        <section className="border-y border-border/50 bg-background min-h-screen flex flex-col justify-center py-16">
            <div className="mx-auto max-w-7xl px-6 w-full">
=======
        <section className="border-y border-border/50 bg-background py-12">
            <div className="mx-auto max-w-7xl px-6">
>>>>>>> origin/main

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
<<<<<<< HEAD
                    <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                        Trusted Worldwide
                    </span>

                    <h2 className="mt-3 text-2xl font-bold text-fg md:text-3xl">
                        Trusted by teams across the world
                    </h2>

                    <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
=======
                    <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                        Trusted Worldwide
                    </span>

                    <h2 className="mt-4 text-2xl font-bold text-fg md:text-3xl">
                        Trusted by teams across the world
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-muted">
>>>>>>> origin/main
                        Professionals, startups and enterprises rely on PDF AI every day
                        to manage millions of documents securely.
                    </p>
                </motion.div>

                {/* Company Logos */}
<<<<<<< HEAD
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {companies.map((company, index) => {
                        const Icon = company.icon;

                        if (company.name === "Figma") {
                            return (
                                <motion.div
                                    key={company.name}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    className="group flex h-20 items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 transition-all hover:border-primary/40 hover:shadow-md"
                                >
                                    {/* Corrected Figma Logo geometry matching the reference layout */}
                                    <svg
                                        width="24"
                                        height="36"
                                        viewBox="0 0 38 57"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                                    >
                                        {/* Top-left pill */}
                                        <path
                                            d="M5.5 8H13.5V23H5.5C2.46243 23 0 20.5376 0 17.5V13.5C0 10.4624 2.46243 8 5.5 8Z"
                                            fill="#F24E1E"
                                        />
                                        {/* Top-right pill */}
                                        <path
                                            d="M13.5 8H21.5C24.5376 8 27 10.4624 27 13.5C27 16.5376 24.5376 19 21.5 19H13.5V8Z"
                                            fill="#FF7262"
                                        />
                                        {/* Middle-left circle/pill */}
                                        <path
                                            d="M5.5 23H13.5V38H5.5C2.46243 38 0 35.5376 0 32.5V28.5C0 25.4624 2.46243 23 5.5 23Z"
                                            fill="#A259FF"
                                        />
                                        {/* Middle-right circle */}
                                        <circle cx="21.5" cy="28.5" r="7.5" fill="#1ABCFE" />
                                        {/* Bottom circle */}
                                        <path
                                            d="M5.5 38H13.5V53H5.5C2.46243 53 0 50.5376 0 47.5V43.5C0 40.4624 2.46243 38 5.5 38Z"
                                            fill="#0ACF83"
                                        />
                                    </svg>
                                    <div className="text-sm">
                                        {company.renderName()}
                                    </div>
                                </motion.div>
                            );
                        }

=======
                <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {companies.map((company, index) => {
                        const Icon = company.icon;

>>>>>>> origin/main
                        return (
                            <motion.div
                                key={company.name}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
<<<<<<< HEAD
                                whileHover={{ y: -3, scale: 1.02 }}
                                className="group flex h-20 items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 transition-all hover:border-primary/40 hover:shadow-md"
                            >
                                <Icon
                                    size={28}
                                    className={`${company.iconColor} transition-transform duration-300 group-hover:scale-110`}
                                />
                                <div className="text-sm">
                                    {company.renderName()}
                                </div>
=======
                                whileHover={{ y: -4, scale: 1.03 }}
                                className="group flex h-20 items-center justify-center rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
                            >
                                <Icon
                                    size={34}
                                    className="text-muted transition-colors duration-300 group-hover:text-primary"
                                />
>>>>>>> origin/main
                            </motion.div>
                        );
                    })}
                </div>

                {/* Stats */}
<<<<<<< HEAD
                <div className="mt-10 grid gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-3">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-primary">50K+</h3>
                        <p className="mt-1.5 text-xs text-muted">
=======
                <div className="mt-10 grid gap-6 rounded-3xl border border-border bg-card p-6 md:grid-cols-3">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-primary">50K+</h3>
                        <p className="mt-1 text-sm text-muted">
>>>>>>> origin/main
                            Active Users
                        </p>
                    </div>

                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-primary">10M+</h3>
<<<<<<< HEAD
                        <p className="mt-1.5 text-xs text-muted">
=======
                        <p className="mt-1 text-sm text-muted">
>>>>>>> origin/main
                            PDFs Processed
                        </p>
                    </div>

                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-primary">150+</h3>
<<<<<<< HEAD
                        <p className="mt-1.5 text-xs text-muted">
=======
                        <p className="mt-1 text-sm text-muted">
>>>>>>> origin/main
                            Countries Served
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}