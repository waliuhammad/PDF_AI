import type { Metadata } from "next";
import { ContentPage, Section } from "@/components/marketing/content-page";
import { DraftNotice, Placeholder } from "@/components/marketing/draft-notice";

export const metadata: Metadata = {
    title: "Security | PDFAI",
    description: "How PDFAI protects your account and your documents.",
};

export default function SecurityPage() {
    return (
        <ContentPage title="Security">
            <DraftNotice />

            <Section heading="Where files are processed">
                <Placeholder>
                    State which tools run entirely in the browser and which upload to a server, so
                    the claim matches what the code actually does.
                </Placeholder>
            </Section>

            <Section heading="Encryption">
                <Placeholder>
                    Describe transport encryption and encryption at rest for stored documents, once
                    file storage is in place.
                </Placeholder>
            </Section>

            <Section heading="Account security">
                <Placeholder>
                    Cover how credentials are handled by the authentication provider, the social
                    sign-in options, password reset, and any multi-factor support.
                </Placeholder>
            </Section>

            <Section heading="Retention and deletion">
                <Placeholder>
                    Give the retention window for uploaded and converted files, and how deletion is
                    carried out.
                </Placeholder>
            </Section>

            <Section heading="Reporting a vulnerability">
                <Placeholder>
                    Provide a disclosure contact and the response time researchers can expect.
                </Placeholder>
            </Section>
        </ContentPage>
    );
}
