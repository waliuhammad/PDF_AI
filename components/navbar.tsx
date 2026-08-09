"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, FileText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

/** Root-relative, not bare hashes. This navbar renders on the content pages
 *  (/terms, /privacy, /about, …) as well as the landing page, and a bare
 *  "#tools" there points at a section that does not exist — the link did
 *  nothing at all. "/#tools" navigates home and lands on the section. */
const navLinks = [
  { name: "Home", href: "/#hero" },
  { name: "Tools", href: "/#tools" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Reviews", href: "/#testimonials" },
  { name: "FAQ", href: "/#faq" },
];

/** "/#tools" -> "#tools". The hash alone is what the DOM and the URL bar use. */
const hashOf = (href: string) => href.slice(href.indexOf("#"));

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const hash = hashOf(href);
    const element = document.getElementById(hash.slice(1));

    // Not on this page — leave the click to the Link, which navigates home and
    // lets the browser scroll to the section. /pricing renders #pricing and
    // #faq itself, so those two still scroll in place there.
    if (!element) return;

    e.preventDefault();

    if (hash === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      element.scrollIntoView({ behavior: "smooth" });
    }

    // The hash alone, so the current path is preserved rather than rewritten.
    window.history.pushState(null, "", hash);
    setActiveHash(hash);
  };

  useEffect(() => {
    // The hash never reaches the server — browsers do not send it — so this
    // cannot be the initial state without the server rendering "#" and the
    // client rendering something else, which is a hydration mismatch. Reading
    // it once on mount is the correct shape here, and the extra render is one
    // class change on a nav link.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveHash(window.location.hash || "#");

    const handleHashChange = () => {
      setActiveHash(window.location.hash || "#");
    };

    window.addEventListener("hashchange", handleHashChange);

    // getElementById, not querySelector — "/#tools" is not a valid selector.
    // On the content pages this finds nothing and the observer simply idles.
    const sections = navLinks
      .map((link) => document.getElementById(hashOf(link.href).slice(1)))
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
            const active = activeHash === hashOf(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative pb-1 text-sm font-medium transition ${
                  active ? "text-primary" : "text-muted hover:text-fg"
                }`}
              >
                {item.name}

                {/* Was a layoutId span, which slid between links — framer's shared
                    layout animation, loaded on every page for one underline. It
                    grows in place instead. */}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-primary transition-all duration-300 ${active ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                />
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
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-lg p-2 lg:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
          <div
            className="border-t border-border bg-background lg:hidden animate-menu-in"
          >
            <div className="space-y-2 px-6 py-6">
              {navLinks.map((item) => {
                const active = activeHash === hashOf(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setOpen(false);
                      handleNavClick(e, item.href);
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
          </div>
        )}
    </header>
  );
}