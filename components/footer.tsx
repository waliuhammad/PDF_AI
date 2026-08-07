import Link from "next/link";
import { FileText } from "lucide-react";
import {
    FaLinkedin,
    FaGithub,
    FaTwitter,
} from "react-icons/fa";


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


function FooterLinkList({ links }: { links: FooterLink[] }) {
    return (
        <ul className="space-y-3">
            {links.map((link) => (
                <li key={link.label} className="text-sm">
                    {link.href ? (
                        <Link href={link.href} className="text-muted hover:text-primary transition-colors">
                            {link.label}
                        </Link>
                    ) : (
                        <span className="text-muted">{link.label}</span>
                    )}
                </li>
            ))}
        </ul>
    );
}


export default function Footer() {

    return (
        <footer
            className="
                border-t
                border-border
                bg-[var(--background-secondary)]
                px-6
                py-16
            "
        >

            <div
                className="
                    max-w-6xl
                    mx-auto
                    grid
                    md:grid-cols-4
                    gap-10
                "
            >

                {/* Brand */}

                <div>

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            mb-4
                        "
                    >

                        <div
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-primary
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <FileText className="text-primary-foreground" />
                        </div>


                        <h2 className="
                            text-xl
                            font-bold
                            text-fg
                        ">
                            PDF AI
                        </h2>

                    </div>


                    <p className="
                        text-muted
                        text-sm
                        leading-relaxed
                    ">
                        All-in-one PDF tools powered by modern technology and AI.
                    </p>


                    <div className="
                        flex
                        gap-4
                        mt-5
                    ">

                        <FaTwitter
                            className="
                                w-5
                                h-5
                                text-muted
                                hover:text-primary
                                cursor-pointer
                            "
                        />

                        <FaLinkedin
                            className="
                                w-5
                                h-5
                                text-muted
                                hover:text-primary
                                cursor-pointer
                            "
                        />

                        <FaGithub
                            className="
                                w-5
                                h-5
                                text-muted
                                hover:text-primary
                                cursor-pointer
                            "
                        />

                    </div>

                </div>



                {/* Product */}

                <div>

                    <h3 className="
                        font-semibold
                        text-fg
                        mb-4
                    ">
                        Product
                    </h3>


                    <FooterLinkList links={productLinks} />

                </div>




                {/* Company */}

                <div>

                    <h3 className="
                        font-semibold
                        text-fg
                        mb-4
                    ">
                        Company
                    </h3>


                    <FooterLinkList links={companyLinks} />

                </div>




                {/* Legal */}

                <div>

                    <h3 className="
                        font-semibold
                        text-fg
                        mb-4
                    ">
                        Legal
                    </h3>


                    <FooterLinkList links={legalLinks} />

                </div>


            </div>



            <div
                className="
                    max-w-6xl
                    mx-auto
                    mt-12
                    pt-6
                    border-t
                    border-border
                    text-center
                    text-sm
                    text-muted
                "
            >
                © {new Date().getFullYear()} PDF AI. All rights reserved.
            </div>


        </footer>
    );
}