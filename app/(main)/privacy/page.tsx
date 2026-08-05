import type { Metadata } from "next";
import { ContentPage, Section } from "@/components/marketing/content-page";
import { DraftNotice } from "@/components/marketing/draft-notice";

export const metadata: Metadata = {
    title: "Privacy Policy | PDFAI",
    description: "Learn how PDFAI protects your files, handles conversion data, and respects your privacy.",
};

export default function PrivacyPage() {
    return (
        <ContentPage title="Privacy Policy">
            <DraftNotice />

            {/* Core Privacy Guarantees */}
            <div className="mb-8 rounded-lg border border-purple-200 bg-purple-50/50 p-6 dark:border-purple-900/40 dark:bg-purple-950/20">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-purple-100">
                    Our Privacy Commitment
                </h3>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-purple-200">
                    At PDFAI, your privacy is central to how we design our software. We do not sell your personal information, analyze the content of your documents for marketing, or train AI models on your private files. You retain 100% ownership of every document you process.
                </p>
            </div>

            {/* 1. Account & Technical Data */}
            <Section heading="What We Collect">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    We only collect the minimal data necessary to create your account, manage subscriptions, and ensure our application runs smoothly:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>Account Information:</strong> When registering, we collect your name, email address, and an optional phone number provided during sign-up.
                    </li>
                    <li>
                        <strong>Technical & Error Logs:</strong> We collect non-identifiable browser metadata, IP addresses, device types, and automated crash reports to fix bugs, optimize performance, and maintain application security.
                    </li>
                </ul>
            </Section>

            {/* 2. File Conversion & Processing Rules */}
            <Section heading="Your Documents & Processing">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    PDFAI processes your documents solely to complete the actions you request—such as converting PDFs into PNG or JPEG images, merging pages, splitting files, or compressing documents.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-gray-200 p-4 dark:border-purple-900/50 dark:bg-purple-950/10">
                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-purple-100">Guest Mode</h4>
                        <p className="text-sm text-gray-700 dark:text-purple-200">
                            Files are processed transiently in your browser session or temporary memory. Once the task finishes and your download window closes, your files are permanently purged. No conversion history or output files are retained.
                        </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-4 dark:border-purple-900/50 dark:bg-purple-950/10">
                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-purple-100">Account Mode</h4>
                        <p className="text-sm text-gray-700 dark:text-purple-200">
                            Your converted files and conversion log are saved securely to your dashboard so you can view, redownload, or manage them at your convenience without uploading the original files again.
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-sm text-gray-600 dark:text-purple-300">
                    * Automated processing runs via secure cloud routines. Human personnel cannot access your file contents unless you specifically request technical support for a failed file conversion and grant explicit permission.
                </p>
            </Section>

            {/* 3. Third-Party Integrations */}
            <Section heading="Third-Party Services">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    We partner only with security-vetted providers who handle data strictly on our behalf under compliant data-processing agreements:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>Authentication & Database:</strong> Secure infrastructure handles password hashing, user sessions, and database storage.
                    </li>
                    <li>
                        <strong>Cloud Processing Infrastructure:</strong> Scalable serverless routines process heavy conversion workflows (e.g., PDF page extraction to image formats).
                    </li>
                    <li>
                        <strong>Payment Gateways:</strong> Account upgrades and subscriptions are processed by PCI-DSS compliant third-party payment providers. We never store or transmit raw credit card details on our own servers.
                    </li>
                </ul>
            </Section>

            {/* 4. Cookies & Display Preferences */}
            <Section heading="Cookies & Local Storage">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    We use cookies and browser local storage strictly for core functionality and user experience enhancements:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>Authentication Cookies:</strong> Secure cookies keep you logged into your account across subpages.
                    </li>
                    <li>
                        <strong>UI Preferences (Theme Settings):</strong> Local storage retains your UI presentation choices on your device, preserving white background preferences in light mode and custom dark purple themes in dark mode.
                    </li>
                </ul>
                <p className="mt-3 text-sm text-gray-600 dark:text-purple-300">
                    We do not use third-party tracking scripts or cross-site advertising cookies.
                </p>
            </Section>

            {/* 5. Legal Rights & Controls */}
            <Section heading="Your Rights & Data Control">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    Whether you are protected under the UK GDPR, EU GDPR, CCPA, or other global regulations, we provide explicit control over your personal data:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-gray-800 dark:text-purple-100">
                    <li>
                        <strong>Access & Export:</strong> Request a complete copy of your registered account data and history at any time.
                    </li>
                    <li>
                        <strong>Deletion Rights:</strong> You can delete individual files or clear your entire conversion history from your account dashboard. Deleting your account will immediately purge your account details, history, and stored files from our production servers.
                    </li>
                </ul>
            </Section>

            {/* 6. Contact Information */}
            <Section heading="Contact Us">
                <p className="mb-4 text-gray-800 dark:text-purple-100">
                    If you have questions about file privacy, data handling, or wish to submit a privacy request:
                </p>
                <div className="rounded-md border border-gray-200 p-4 text-gray-800 dark:border-purple-900/40 dark:bg-purple-950/10 dark:text-purple-100">
                    <p className="font-semibold">PDFAI Legal & Privacy Team</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-purple-300">Email: support@pdfai.com</p>
                    <p className="text-sm text-gray-600 dark:text-purple-300">PDFAI LLC — Data Protection Office</p>
                </div>
            </Section>
        </ContentPage>
    );
}