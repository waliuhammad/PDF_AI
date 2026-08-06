import { ContentPage, Section } from "@/components/marketing/content-page";
import { DraftNotice } from "@/components/marketing/draft-notice";

/**
 * Same shell as /security and the other content pages.
 *
 * This page used to carry its own copy of the navbar and footer, its own set
 * of colour constants, and a sticky section index none of the other legal
 * pages have — so it drifted from them in both look and behaviour. All of that
 * now comes from ContentPage, which also means the page no longer needs to be
 * a client component: framer-motion and react-icons were only there for the
 * navbar it was duplicating.
 */

const clauses = [
    {
        heading: "1. Using the Service",
        items: [
            [
                "1.1",
                "By accessing or using PDFAI, you agree to be bound by these Terms of Service. You must be at least 13 years of age to create an account or use our processing tools.",
            ],
            [
                "1.2",
                "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
            ],
        ],
    },
    {
        heading: "2. Acceptable Use",
        items: [
            [
                "2.1",
                "You must use PDFAI legally. You are strictly prohibited from using the PDFAI service to generate, store, convert, or share any content that violates laws or third-party rights.",
            ],
        ],
    },
    {
        heading: "3. Your Content & Files",
        items: [
            [
                "3.1",
                "You retain full ownership of all documents and files uploaded to PDFAI.",
            ],
        ],
    },
];

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-800 dark:bg-[#13131d] dark:text-purple-100">
            <main className="flex-1">
                <ContentPage title="Terms of Service">
                    <DraftNotice />

                    <p className="text-sm text-slate-500 dark:text-purple-300/60">
                        Last updated: August 5, 2026
                    </p>

                    {clauses.map((clause) => (
                        <Section key={clause.heading} heading={clause.heading}>
                            <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-purple-200">
                                {clause.items.map(([number, text]) => (
                                    <p key={number}>
                                        <strong className="mr-2 text-slate-900 dark:text-white">
                                            {number}
                                        </strong>
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </Section>
                    ))}

                    <Section heading="4. Contact Us">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-purple-900/30 dark:bg-[#181824]">
                            <h3 className="mb-2 font-bold text-slate-900 dark:text-white">
                                PDFAI Legal &amp; Privacy Team
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-purple-200/80">
                                Email: support@pdfai.com
                            </p>
                            <p className="text-sm text-slate-600 dark:text-purple-200/80">
                                PDFAI LLC — Data Protection Office
                            </p>
                        </div>
                    </Section>
                </ContentPage>
            </main>
        </div>
    );
}
