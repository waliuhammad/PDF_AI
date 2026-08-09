import Link from "next/link";
import { FileText } from "lucide-react";
import {
    FaLinkedin,
    FaGithub,
    FaTwitter,
} from "react-icons/fa";
import type { IconType } from "react-icons";


/** `href` is omitted where the destination page doesn't exist yet — those render
 *  as plain text rather than as links that would 404. */
interface FooterLink {
    label: string;
    href?: string;
}

const productLinks: FooterLink[] = [
    { label: "Merge PDF", href: "/merge-pdf" },
    { label: "Compress PDF", href: "/compress-pdf" },
    // Labels match the names in lib/tools.ts, so the footer and the tools grid
    // call the same tool the same thing.
    { label: "Edit PDF", href: "/edit-pdf" },
    { label: "OCR PDF", href: "/ocr-pdf" },
    // /chats is the signed-in thread list, so a visitor clicking this from the
    // marketing footer was bounced to the login page. /chat-pdf is the tool.
    { label: "Chat with PDF", href: "/chat-pdf" },
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


/** Same rule as FooterLink: no `href` means no account exists yet, so the icon
 *  renders without a cursor or hover rather than looking clickable and doing
 *  nothing. Fill in `href` to turn one on. */
const socials: { label: string; icon: IconType; href?: string }[] = [
    { label: "Twitter", icon: FaTwitter },
    { label: "LinkedIn", icon: FaLinkedin },
    { label: "GitHub", icon: FaGithub },
];


function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
    return (
        // Centred while the three columns share one row on a phone; left-aligned
        // from md, where they sit beside the brand block as on desktop.
        <div className="text-center md:text-left">
            <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>

            <ul className="space-y-0.5">
                {links.map((link) => (
                    <li key={link.label} className="text-sm">
                        {link.href ? (
                            <Link
                                href={link.href}
                                // inline-block with vertical padding, so each link is a
                                // 24px-tall tap target on a phone rather than a 16px
                                // line of text.
                                className="inline-block py-1 text-muted transition-colors hover:text-primary"
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <span className="inline-block py-1 text-muted">{link.label}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default function Footer() {
    return (
        <footer className="border-t border-border bg-[var(--background-secondary)] px-4 sm:px-6 py-10 sm:py-14">
            <div className="mx-auto max-w-6xl">

                <div className="grid gap-8 sm:gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">

                    {/* Brand — centred on a phone to match the link columns
                        below it, left-aligned from md as on desktop. */}
                    <div className="text-center md:text-left">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                                <FileText size={18} className="text-primary-foreground" />
                            </span>

                            <span className="text-lg font-bold text-fg">PDF AI</span>
                        </Link>

                        {/* mx-auto so the max-w-xs block itself centres, not just
                            the text inside it. */}
                        <p className="mt-3 max-w-xs mx-auto md:mx-0 text-sm leading-relaxed text-muted">
                            All-in-one PDF tools powered by modern technology and AI.
                        </p>

                        <div className="mt-4 flex justify-center gap-2 md:justify-start">
                            {socials.map(({ label, icon: Icon, href }) =>
                                href ? (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        aria-label={label}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-card text-muted transition-colors hover:border-primary hover:text-primary"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                ) : (
                                    <span
                                        key={label}
                                        aria-hidden="true"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-card text-muted opacity-60"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    {/* md:contents dissolves this wrapper on desktop so the three
                        columns join the outer grid. On a phone all three sit in
                        one row; the gap is tight because at 320px each column is
                        only ~88px and "Terms of Service" needs the room. */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 md:contents">
                        <FooterColumn title="Product" links={productLinks} />
                        <FooterColumn title="Company" links={companyLinks} />
                        <FooterColumn title="Legal" links={legalLinks} />
                    </div>

                </div>


                <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-5 text-sm text-muted sm:mt-12 sm:flex-row sm:justify-between">
                    <p>© {new Date().getFullYear()} PDF AI. All rights reserved.</p>

                    <p>Your files stay yours — processed, never sold.</p>
                </div>

            </div>
        </footer>
    );
}
