"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { DraftNotice } from "@/components/marketing/draft-notice";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_BG = "rgb(27, 26, 38)";
const FOOTER_BG = "#13131a"; // Distinct, deeper dark tone for the footer
const BORDER_COLOR = "rgba(255, 255, 255, 0.08)";

/* -------------------------------------------------------------------------- */
/* NAVBAR COMPONENT                                                           */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Tools", href: "/#tools" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Reviews", href: "/#testimonials" },
  { name: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash || "");

    const handleHashChange = () => {
      setActiveHash(window.location.hash || "");
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b text-white"
      style={{
        backgroundColor: NAV_BG,
        borderColor: BORDER_COLOR,
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6] text-white shadow-md shadow-purple-900/20">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white leading-tight">PDF AI</h2>
            <p className="text-xs text-purple-300/60 leading-none">Smart PDF Workspace</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => {
            const isHashMatch =
              item.href.includes("#") && activeHash === item.href.substring(item.href.indexOf("#"));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (item.href.includes("#")) {
                    setActiveHash(item.href.substring(item.href.indexOf("#")));
                  } else {
                    setActiveHash("");
                  }
                }}
                className={`relative pb-1 text-sm font-medium transition ${
                  isHashMatch
                    ? "text-purple-300"
                    : "text-purple-200/60 hover:text-white"
                }`}
              >
                {item.name}

                {isHashMatch && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-[#8b5cf6]"
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
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#8b5cf6] px-5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#7c3aed] shadow-sm shadow-purple-900/30"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-purple-200 lg:hidden"
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
            className="border-t text-white lg:hidden"
            style={{
              backgroundColor: NAV_BG,
              borderColor: BORDER_COLOR,
            }}
          >
            <div className="space-y-2 px-6 py-6">
              {navLinks.map((item) => {
                const isHashMatch =
                  item.href.includes("#") && activeHash === item.href.substring(item.href.indexOf("#"));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setOpen(false);
                      if (item.href.includes("#")) {
                        setActiveHash(item.href.substring(item.href.indexOf("#")));
                      } else {
                        setActiveHash("");
                      }
                    }}
                    className={`block rounded-xl px-4 py-3 transition ${
                      isHashMatch
                        ? "bg-purple-900/30 text-purple-200"
                        : "text-purple-200/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-purple-300/70">Appearance</span>
                <ThemeToggle />
              </div>

              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/20 py-3 text-center text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-[#8b5cf6] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#7c3aed]"
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

/* -------------------------------------------------------------------------- */
/* FOOTER COMPONENT                                                           */
/* -------------------------------------------------------------------------- */

interface FooterLink {
  label: string;
  href?: string;
}

const productLinks: FooterLink[] = [
  { label: "Merge PDF", href: "/merge-pdf" },
  { label: "Compress PDF", href: "/compress-pdf" },
  { label: "PDF Converter", href: "/tools?category=Convert" },
  { label: "OCR Scanner" },
  { label: "AI PDF Chat", href: "/chats" },
];

const companyLinks: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Security", href: "/security" },
];

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.label} className="text-sm">
          {link.href ? (
            <Link href={link.href} className="text-purple-200/60 hover:text-white transition-colors">
              {link.label}
            </Link>
          ) : (
            <span className="text-purple-200/30">{link.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer
      className="border-t px-6 py-16 text-white"
      style={{
        backgroundColor: FOOTER_BG,
        borderColor: BORDER_COLOR,
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6] text-white shadow-md shadow-purple-900/20">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">PDF AI</h2>
          </div>

          <p className="text-sm leading-relaxed text-purple-200/60">
            All-in-one PDF tools powered by modern technology and AI.
          </p>

          <div className="mt-5 flex gap-4">
            <FaTwitter className="h-5 w-5 cursor-pointer text-purple-300/50 hover:text-white transition-colors" />
            <FaLinkedin className="h-5 w-5 cursor-pointer text-purple-300/50 hover:text-white transition-colors" />
            <FaGithub className="h-5 w-5 cursor-pointer text-purple-300/50 hover:text-white transition-colors" />
          </div>
        </div>

        {/* Product */}
        <div>
          <h3 className="mb-4 font-semibold text-white">Product</h3>
          <FooterLinkList links={productLinks} />
        </div>

        {/* Company */}
        <div>
          <h3 className="mb-4 font-semibold text-white">Company</h3>
          <FooterLinkList links={companyLinks} />
        </div>

        {/* Legal */}
        <div>
          <h3 className="mb-4 font-semibold text-white">Legal</h3>
          <FooterLinkList links={legalLinks} />
        </div>
      </div>

      <div
        className="mx-auto mt-12 max-w-6xl border-t pt-6 text-center text-sm text-purple-300/40"
        style={{ borderColor: BORDER_COLOR }}
      >
        © {new Date().getFullYear()} PDF AI. All rights reserved.
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN TERMS PAGE                                                            */
/* -------------------------------------------------------------------------- */

export default function TermsPage() {
  return (
    <div
      className="flex min-h-screen flex-col text-purple-100"
      style={{ backgroundColor: NAV_BG }}
    >
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 border-b pb-6" style={{ borderColor: BORDER_COLOR }}>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-purple-300/60">
              Last updated: August 5, 2026
            </p>
            <div className="mt-4">
              <DraftNotice />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
            <nav className="hidden lg:block">
              <div className="sticky top-24 space-y-1 text-sm font-medium">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-400/80">
                  General Terms
                </p>
                <a href="#using-the-service" className="block rounded-md px-3 py-2 text-purple-200/70 hover:bg-white/5 hover:text-white">
                  1. Using the Service
                </a>
                <a href="#acceptable-use" className="block rounded-md px-3 py-2 text-purple-200/70 hover:bg-white/5 hover:text-white">
                  2. Acceptable Use
                </a>
                <a href="#your-content" className="block rounded-md px-3 py-2 text-purple-200/70 hover:bg-white/5 hover:text-white">
                  3. Your Content & Files
                </a>
                <a href="#contact-us" className="block rounded-md px-3 py-2 text-purple-200/70 hover:bg-white/5 hover:text-white">
                  4. Contact Us
                </a>
              </div>
            </nav>

            <div className="lg:col-span-3 space-y-12">
              <section id="using-the-service" className="scroll-mt-28">
                <h2 className="text-xl font-bold text-white mb-4">
                  1. Using the Service
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-purple-200/70">
                  <p>
                    <strong className="text-white mr-2">1.1</strong>
                    By accessing or using PDFAI, you agree to be bound by these Terms of Service. You must be at least 13 years of age to create an account or use our processing tools.
                  </p>
                  <p>
                    <strong className="text-white mr-2">1.2</strong>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                  </p>
                </div>
              </section>

              <section id="acceptable-use" className="scroll-mt-28 border-t pt-8" style={{ borderColor: BORDER_COLOR }}>
                <h2 className="text-xl font-bold text-white mb-4">
                  2. Acceptable Use
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-purple-200/70">
                  <p>
                    <strong className="text-white mr-2">2.1</strong>
                    You must use PDFAI legally. You are strictly prohibited from using the PDFAI service to generate, store, convert, or share any content that violates laws or third-party rights.
                  </p>
                </div>
              </section>

              <section id="your-content" className="scroll-mt-28 border-t pt-8" style={{ borderColor: BORDER_COLOR }}>
                <h2 className="text-xl font-bold text-white mb-4">
                  3. Your Content & Files
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-purple-200/70">
                  <p>
                    <strong className="text-white mr-2">3.1</strong>
                    You retain full ownership of all documents and files uploaded to PDFAI.
                  </p>
                </div>
              </section>

              <section id="contact-us" className="scroll-mt-28 border-t pt-8" style={{ borderColor: BORDER_COLOR }}>
                <h2 className="text-xl font-bold text-white mb-4">
                  4. Contact Us
                </h2>
                <div
                  className="rounded-xl p-6 border shadow-sm"
                  style={{ backgroundColor: "rgb(35, 33, 51)", borderColor: BORDER_COLOR }}
                >
                  <h3 className="font-bold text-white mb-2">PDFAI Legal & Privacy Team</h3>
                  <p className="text-sm text-purple-200/80">Email: support@pdfai.com</p>
                  <p className="text-sm text-purple-200/80">PDFAI LLC — Data Protection Office</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}