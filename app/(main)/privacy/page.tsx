import type { Metadata } from "next";
import { ContentPage, Section } from "@/components/marketing/content-page";
import { DraftNotice, Placeholder } from "@/components/marketing/draft-notice";

export const metadata: Metadata = {
    title: "Privacy Policy | PDFAI",
    description: "How PDFAI collects, uses and stores your data.",
};

export default function PrivacyPage() {
    return (
        <ContentPage title="Privacy Policy">
            <DraftNotice />

            <Section heading="What we collect">
                <Placeholder>
                    Describe the account data collected at sign-up (name, email, and the optional
                    phone number the registration form asks for), and any usage or analytics data.
                </Placeholder>
            </Section>

            <Section heading="Your documents">
                <Placeholder>
                    State which tools process files in the browser and which upload them to a
                    server, how long uploaded files are retained, and when they are deleted.
                </Placeholder>
            </Section>

            <Section heading="Third parties">
                <Placeholder>
                    List the processors that receive data — authentication and database providers,
                    any conversion or AI services, payment processors — and link their policies.
                </Placeholder>
            </Section>

            <Section heading="Cookies and local storage">
                <Placeholder>
                    Cover the sign-in session and the preferences saved on the device from the
                    settings page.
                </Placeholder>
            </Section>

            <Section heading="Your rights">
                <Placeholder>
                    Explain how to access, export or delete an account and its data, and which
                    regimes apply (UK GDPR, EU GDPR, CCPA) given where users are.
                </Placeholder>
            </Section>

            <Section heading="Contact">
                <Placeholder>
                    Give the controller&apos;s legal name, registered address and a contact route
                    for privacy requests.
                </Placeholder>
            </Section>
        </ContentPage>
    );
}
