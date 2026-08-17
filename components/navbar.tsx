"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isToolPath } from "@/lib/tool-paths";
import { useState, useEffect } from "react";
import { Menu, X, FileText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

/** Root-relative, not bare hashes. This navbar renders on the content pages
 *  (/terms, /privacy, /about, …) as well as the landing page, and a bare
 *  "#tools" there points at a section that does not exist — the link did
 *  nothing at all. "/#tools" navigates home and lands on the section. */
const navLinks = [
  { name: "Home", href: "/#hero" },
  // `page` is the real route this link also stands for. The active state was
  // decided purely by the landing page's hash, so on /tools — a page of its
  // own, with no #tools section in it — nothing matched and no link was
  // underlined at all. Same on /pricing.
  { name: "Tools", href: "/#tools", page: "/tools" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "Pricing", href: "/#pricing", page: "/pricing" },
  { name: "FAQ", href: "/#faq" },
];

/** "/#tools" -> "#tools". The hash alone is what the DOM and the URL bar use. */
const hashOf = (href: string) => href.slice(href.indexOf("#"));

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();

  /**
   * Which link to underline.
   *
   * On the landing page the sections are what the visitor is looking at, so
   * the hash decides. Anywhere else there are no sections to observe and the
   * route is the only thing that says where they are.
   */
  const isActive = (item: (typeof navLinks)[number]) => {
    if (pathname === "/") return activeHash === hashOf(item.href);

    // A tool's own page is still "Tools" as far as the bar is concerned —
    // /merge-pdf is not a section anywhere, so without this nothing lights up
    // on any of the twenty-one tool pages.
    if (item.page === "/tools") return isToolPath(pathname);

    return item.page === pathname;
  };

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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Logo */}
        {/* min-w-0 + truncate: the tagline is the one piece of the bar that can
            grow, so it shortens rather than pushing the actions off a 320px
            screen. */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:h-10 sm:w-10">
            <FileText size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-fg sm:text-lg">PDF AI</h2>
            <p className="truncate text-xs text-muted">Smart PDF Workspace</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => {
            const active = isActive(item);

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

        {/* Mobile actions. The theme toggle sits in the bar itself, beside the
            menu button, so switching theme on a phone no longer means opening
            the menu first. */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            // p-2.5 around a 24px icon gives a 44px target, the minimum
            // comfortable tap size.
            className="rounded-lg p-2.5"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
          <div
            className="border-t border-border bg-background lg:hidden animate-menu-in"
          >
            <div className="space-y-1 px-4 py-4 sm:space-y-2 sm:px-6 sm:py-6">
              {navLinks.map((item) => {
                const active = isActive(item);

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

              {/* The Appearance row lived here; the toggle is now in the header
                  bar above, visible without opening the menu. */}
              <div className="mt-4 flex flex-col gap-3">
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