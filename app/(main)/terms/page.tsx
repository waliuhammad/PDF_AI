import type { Metadata } from "next";
import { ContentPage, Section } from "@/components/marketing/content-page";
import { DraftNotice, Placeholder } from "@/components/marketing/draft-notice";

export const metadata: Metadata = {
    title: "Terms of Service | PDFAI",
    description: "The terms that govern your use of PDFAI.",
};

export default function TermsPage() {
    return (
        <ContentPage title="Terms of Service">
            <DraftNotice />

            <Section heading="Using the service">
                <Placeholder>
                    Set out who may open an account, the age requirement, and that the account
                    holder is responsible for activity under their credentials.
                </Placeholder>
            </Section>

            <Section heading="Acceptable use">
                <Placeholder>
                    Prohibit uploading unlawful content or material the user has no right to
                    process, and abuse of the conversion or AI endpoints.
                </Placeholder>
            </Section>

            <Section heading="Your content">
                <Placeholder>
                    Confirm the user keeps ownership of uploaded files, and grant only the narrow
                    licence needed to process and return them.
                </Placeholder>
            </Section>

            <Section heading="Plans, billing and refunds">
                <Placeholder>
                    Cover the paid tiers, billing period, renewal, cancellation and refund terms,
                    matching whatever the checkout flow ends up offering.
                </Placeholder>
            </Section>

            <Section heading="Availability and liability">
                <Placeholder>
                    Address uptime expectations, the absence of warranty on conversion accuracy or
                    AI output, and the limitation of liability.
                </Placeholder>
            </Section>

            <Section heading="Termination and changes">
                <Placeholder>
                    Explain suspension and termination, how changes to these terms are notified,
                    and the governing jurisdiction.
                </Placeholder>
            </Section>
        </ContentPage>
    );
}
