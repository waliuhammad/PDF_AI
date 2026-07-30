"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> origin/main
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
<<<<<<< HEAD
    const [activeHash, setActiveHash] = useState("#tools");

    useEffect(() => {
        const updateHash = () => {
            setActiveHash(window.location.hash || "#tools");
        };

        updateHash();

        window.addEventListener("hashchange", updateHash);

        return () => window.removeEventListener("hashchange", updateHash);
    }, []);
=======
>>>>>>> origin/main

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
<<<<<<< HEAD
                    {navLinks.map((item) => {
                        const active = activeHash === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setActiveHash(item.href)}
                                className={`relative pb-1 text-sm font-medium transition ${
                                    active
                                        ? "text-indigo-600"
                                        : "text-muted hover:text-fg"
                                }`}
                            >
                                {item.name}

                                {active && (
                                    <motion.span
                                        layoutId="navbar-underline"
                                        className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-indigo-600"
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 35,
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
=======
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-muted transition hover:text-fg"
                        >
                            {item.name}
                        </Link>
                    ))}
>>>>>>> origin/main
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-3 lg:flex">
<<<<<<< HEAD
                    <button
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                            activeHash === "#login"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-border hover:border-indigo-600 hover:text-indigo-600"
                        }`}
                        onClick={() => setActiveHash("#login")}
                    >
                        Login
                    </button>

                    <button className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
=======
                    <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary">
                        Sign In
                    </button>

                    <button className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
>>>>>>> origin/main
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

<<<<<<< HEAD
                            {navLinks.map((item) => {
                                const active = activeHash === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => {
                                            setOpen(false);
                                            setActiveHash(item.href);
                                        }}
                                        className={`block rounded-xl px-4 py-3 transition ${
                                            active
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-muted hover:bg-primary/10 hover:text-primary"
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}

                            <div className="mt-4 flex flex-col gap-3">
                                <button
                                    className={`rounded-xl border py-3 font-medium transition ${
                                        activeHash === "#login"
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-border"
                                    }`}
                                    onClick={() => setActiveHash("#login")}
                                >
                                    Login
                                </button>

                                <button className="rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700">
=======
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
>>>>>>> origin/main
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