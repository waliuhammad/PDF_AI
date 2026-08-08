import { ContentPage, Section } from "@/components/marketing/content-page";

/**
 * Same shell as /security and the other content pages.
 *
 * The clauses live in a plain array so the page stays a server component
 * and the legal text can be edited without touching any markup.
 */

const clauses = [
    {
        heading: "1. Agreement & Eligibility",
        items: [
            [
                "1.1",
                "By accessing or using PDFAI, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.",
            ],
            [
                "1.2",
                "You must be at least 13 years of age to use PDFAI. To purchase a paid plan you must be at least 18, or have the consent of a parent or guardian.",
            ],
            [
                "1.3",
                "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately if you suspect unauthorised use.",
            ],
        ],
    },
    {
        heading: "2. The Service",
        items: [
            [
                "2.1",
                "PDFAI provides online tools for working with PDF documents, including conversion, merging, splitting, compression, signing, and AI-assisted features such as summarisation, translation, grammar checking, OCR, and document chat.",
            ],
            [
                "2.2",
                "AI-assisted features are powered by third-party machine-learning models. Their output is generated automatically and may contain errors, omissions, or inaccuracies. You are responsible for reviewing AI output before relying on it; it does not constitute professional, legal, medical, or financial advice.",
            ],
            [
                "2.3",
                "We may modify, add, or remove features of the service at any time. We will make reasonable efforts to announce material changes to paid features in advance.",
            ],
        ],
    },
    {
        heading: "3. Acceptable Use",
        items: [
            [
                "3.1",
                "You must use PDFAI only for lawful purposes. You may not upload, process, generate, store, or share content that is illegal, infringes third-party rights (including copyright), contains malware, or that you do not have the right to process.",
            ],
            [
                "3.2",
                "You may not attempt to disrupt or overload the service, probe or bypass its security or plan limits, scrape it, resell it, or access it by automated means except through interfaces we provide.",
            ],
            [
                "3.3",
                "We may suspend or terminate accounts that violate this section, with or without notice, and without refund where the violation is serious or repeated.",
            ],
        ],
    },
    {
        heading: "4. Your Content & Files",
        items: [
            [
                "4.1",
                "You retain full ownership of all documents and files you upload to PDFAI. We claim no rights over your content.",
            ],
            [
                "4.2",
                "You grant us a limited licence to store and process your files solely to provide the service to you — for example converting a document you submit, or passing its text to an AI model to generate the summary you requested.",
            ],
            [
                "4.3",
                "Files uploaded for one-off processing are kept only as long as needed to complete the operation. Documents and chats you choose to save to your account are retained until you delete them or your account is closed. Details are described in our Privacy Policy.",
            ],
            [
                "4.4",
                "You are responsible for keeping your own copies of your files. PDFAI is a processing tool, not a backup service.",
            ],
        ],
    },
    {
        heading: "5. Plans, Billing & Cancellation",
        items: [
            [
                "5.1",
                "PDFAI offers a Free plan with limited usage and paid subscription plans (Pro and Business) billed monthly or yearly. Current prices and plan features are shown on the pricing page at the time of purchase.",
            ],
            [
                "5.2",
                "Payments are processed by our third-party payment provider acting as merchant of record. Your purchase is also subject to that provider's terms. We never see or store your full card details.",
            ],
            [
                "5.3",
                "Subscriptions renew automatically at the end of each billing period until cancelled. You can cancel at any time from Settings → Subscription & Billing; your plan then remains active until the end of the period already paid for, and no further charges are made.",
            ],
            [
                "5.4",
                "Except where required by law or by our payment provider's refund policy, payments already made are non-refundable. If we permanently discontinue a paid feature you have paid for, we will refund the unused portion of your subscription.",
            ],
            [
                "5.5",
                "We may change plan prices with at least 30 days' notice. Price changes take effect at your next renewal, so you can cancel before being charged the new price.",
            ],
        ],
    },
    {
        heading: "6. Intellectual Property",
        items: [
            [
                "6.1",
                "The PDFAI service — including its software, design, branding, and content other than your files — is owned by us or our licensors and is protected by intellectual-property laws. These Terms grant you a limited, non-exclusive, non-transferable right to use the service; they do not transfer any ownership to you.",
            ],
        ],
    },
    {
        heading: "7. Disclaimers & Limitation of Liability",
        items: [
            [
                "7.1",
                "The service is provided \"as is\" and \"as available\". To the fullest extent permitted by law, we disclaim all warranties, express or implied, including fitness for a particular purpose and non-infringement. We do not warrant that the service will be uninterrupted, error-free, or that processed output will be accurate.",
            ],
            [
                "7.2",
                "To the fullest extent permitted by law, our total liability for any claims arising out of or relating to the service is limited to the amount you paid us in the 12 months before the claim arose, or £20 if you have paid nothing. We are not liable for indirect, incidental, or consequential damages, or for loss of data, profits, or business.",
            ],
            [
                "7.3",
                "Nothing in these Terms excludes liability that cannot be excluded under applicable law.",
            ],
        ],
    },
    {
        heading: "8. Termination",
        items: [
            [
                "8.1",
                "You may stop using PDFAI and delete your account at any time. We may suspend or terminate your access if you materially breach these Terms, if required by law, or if we discontinue the service. On termination, your right to use the service ends and stored content may be deleted after a reasonable period.",
            ],
        ],
    },
    {
        heading: "9. Changes to These Terms",
        items: [
            [
                "9.1",
                "We may update these Terms from time to time. The \"Last updated\" date above reflects the current version. For material changes we will provide notice through the service or by email. Continued use after changes take effect constitutes acceptance of the updated Terms.",
            ],
        ],
    },
    {
        heading: "10. Governing Law & Contact",
        items: [
            [
                "10.1",
                "These Terms are governed by the laws of Pakistan, without regard to conflict-of-law principles, and disputes are subject to the exclusive jurisdiction of the courts of Pakistan.",
            ],
            [
                "10.2",
                "Questions about these Terms can be sent to us via the contact page.",
            ],
        ],
    },
];

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-800 dark:bg-[#13131d] dark:text-purple-100">
            <main className="flex-1">
                <ContentPage title="Terms of Service">
                    <p className="text-sm text-slate-500 dark:text-purple-300/60">
                        Last updated: August 8, 2026
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
                </ContentPage>
            </main>
        </div>
    );
}