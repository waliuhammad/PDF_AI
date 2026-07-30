"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Tools", href: "#tools" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Reviews", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
];

export function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <FileText size={20} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-fg">
                            PDF AI
                        </h2>

                        <p className="text-xs text-muted">
                            Smart PDF Workspace
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-muted transition hover:text-fg"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-3 lg:flex">
                    <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary">
                        Sign In
                    </button>

                    <button className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                        Start Free
                    </button>
                </div>

                {/* Mobile Button */}
                <button
                    onClick={() => setOpen(!open)}
                    className="rounded-lg p-2 lg:hidden"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border bg-background lg:hidden"
                    >
                        <div className="space-y-2 px-6 py-6">

                            {navLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="block rounded-xl px-4 py-3 text-muted transition hover:bg-primary/10 hover:text-primary"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <div className="mt-4 flex flex-col gap-3">
                                <button className="rounded-xl border border-border py-3 font-medium">
                                    Sign In
                                </button>

                                <button className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground">
                                    Start Free
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}