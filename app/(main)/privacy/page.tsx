import type { Metadata } from "next";
import { ContentPage, Section } from "@/components/marketing/content-page";

export const metadata: Metadata = {
    title: "Privacy Policy | PDFAI",
    description: "Learn how PDFAI protects your files, handles conversion data, and respects your privacy.",
};

export default function PrivacyPage() {
    return (
        <ContentPage title="Privacy Policy">
            <p className="text-sm text-slate-500 dark:text-purple-300/60">
                Last updated: August 8, 2026
            </p>

            {/* Core Privacy Guarantees */}
            <div className="mb-8 mt-4 rounded-lg border border-purple-200 bg-purple-50/50 p-6 dark:border-purple-900/40 dark:bg-purple-950/20">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-purple-100">
                    Our Privacy Commitment
                </h3>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-purple-200">
                    At PDFAI, your privacy is central to how we design our software. We do not sell
                    your personal information, analyse the content of your documents for marketing,
                    or train AI models on your private files. You retain 100% ownership of every
                    document you process.
                </p>
            </div>

            {/* 1. What we collect */}
            <Section heading="What We Collect">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    We collect only the data needed to create your account, provide the tools,
                    manage subscriptions, and keep the application running reliably:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>Account information:</strong> your name, email address, and an
                        optional phone number, collected when you register. Authentication is
                        handled by Google Firebase on our behalf.
                    </li>
                    <li>
                        <strong>Your files and chats:</strong> documents you upload for processing,
                        and documents or chat conversations you choose to save to your account.
                    </li>
                    <li>
                        <strong>Billing information:</strong> your plan, subscription status, and
                        payment history. Card details are collected and stored by our payment
                        provider, never by us.
                    </li>
                    <li>
                        <strong>Technical logs:</strong> IP address, browser and device metadata,
                        and automated error reports, used to fix bugs, prevent abuse, and keep the
                        service secure.
                    </li>
                </ul>
            </Section>

            {/* 2. How files are processed */}
            <Section heading="How Your Files Are Processed">
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>One-off tools</strong> (conversions, merge, split, compress, and
                        similar): your file is processed to produce the output you requested and is
                        not kept afterwards. Temporary copies created during processing are deleted
                        automatically.
                    </li>
                    <li>
                        <strong>Saved documents and chats:</strong> if you save a document or start
                        a document chat while signed in, that content is stored against your
                        account (in Google Firebase / Firestore) until you delete it or close your
                        account.
                    </li>
                    <li>
                        <strong>We never</strong> read your documents for advertising, sell their
                        contents, or use them to train our own or anyone else&apos;s AI models.
                    </li>
                </ul>
            </Section>

            {/* 3. AI features */}
            <Section heading="AI Features & Third-Party Processing">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    Some features — summaries, translation, grammar checking, OCR, and document
                    chat — are powered by third-party AI models (currently Google&apos;s Gemini
                    API). When you use one of these features:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        The relevant text of your document is sent to the AI provider to generate
                        the result you asked for, and for no other purpose.
                    </li>
                    <li>
                        This happens only when you actively use an AI feature — files processed
                        with the standard PDF tools are never sent to AI providers.
                    </li>
                    <li>
                        The provider processes this data under its own terms; Google states that
                        data submitted via the paid Gemini API is not used to train its models.
                    </li>
                </ul>
            </Section>

            {/* 4. Service providers */}
            <Section heading="Who We Share Data With">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    We never sell your data. We share it only with the service providers that make
                    PDFAI work, each receiving the minimum necessary:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>Google Firebase</strong> — sign-in and account storage (including
                        saved documents and chats).
                    </li>
                    <li>
                        <strong>Google Gemini API</strong> — AI processing, as described above.
                    </li>
                    <li>
                        <strong>Our payment provider</strong> — subscription billing as merchant of
                        record; they handle your card details under their own privacy policy.
                    </li>
                    <li>
                        <strong>Our hosting provider</strong> — the servers the application runs
                        on.
                    </li>
                </ul>
                <p className="mt-4 text-gray-800 dark:text-purple-100">
                    We may also disclose information where required by law, or to protect the
                    rights, safety, or security of PDFAI and its users.
                </p>
            </Section>

            {/* 5. Legal rights */}
            <Section heading="Your Rights & Data Control">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    Whether you are protected under the UK GDPR, EU GDPR, CCPA, or other
                    regulations, we provide control over your personal data:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>Access &amp; export:</strong> request a copy of the account data we
                        hold about you at any time.
                    </li>
                    <li>
                        <strong>Deletion:</strong> delete individual documents and chats from your
                        dashboard at any time. Deleting your account removes your account details,
                        saved documents, and chat history from our production systems.
                    </li>
                    <li>
                        <strong>Correction &amp; objection:</strong> update your profile details in
                        Settings, or contact us to correct anything else or object to a use of
                        your data.
                    </li>
                </ul>
            </Section>

            {/* 6. Contact */}
            <Section heading="Contact Us">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    If you have questions about file privacy, data handling, or wish to submit a
                    privacy request, reach us through the contact page or by email:
                </p>
                <div className="rounded-md border border-gray-200 p-4 text-gray-800 dark:border-purple-900/40 dark:bg-purple-950/10 dark:text-purple-100">
                    <p className="font-semibold">PDFAI — Privacy</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-purple-300">
                        Email: support@pdfai.com
                    </p>
                </div>
            </Section>
        </ContentPage>
    );
}