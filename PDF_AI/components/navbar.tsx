"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Tools", href: "#tools" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Reviews", href: "#testimonials" },
  { name: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash || "#");

    const handleHashChange = () => {
      setActiveHash(window.location.hash || "#");
    };

    window.addEventListener("hashchange", handleHashChange);

    const sections = navLinks
      .filter((link) => link.href !== "#")
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      observer.disconnect();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-fg">PDF AI</h2>
            <p className="text-xs text-muted">Smart PDF Workspace</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => {
            const active = activeHash === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setActiveHash(item.href)}
                className={`relative pb-1 text-sm font-medium transition ${
                  active ? "text-primary" : "text-muted hover:text-fg"
                }`}
              >
                {item.name}

                {active && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-primary"
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
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          <Link
            href="/login"
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
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
                        ? "bg-primary/10 text-primary"
                        : "text-muted hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted">Appearance</span>
                <ThemeToggle />
              </div>

              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border py-3 text-center font-medium transition hover:border-primary hover:text-primary"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}