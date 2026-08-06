import type { Metadata } from "next";
import { ContentPage, Section } from "@/components/marketing/content-page";

export const metadata: Metadata = {
    title: "AI Chat",
    description: "Ask questions about any PDF and receive accurate answers instantly.",
    alternates: { canonical: "/chatai-info" },
};

export default function ChatAIInfoPage() {
    return (
        <ContentPage title="AI Chat" intro="Ask questions about any PDF and receive accurate answers instantly.">
            <Section heading="What it does">
                <p>Our AI Chat feature allows you to converse directly with your documents. Using advanced language models, it extracts context, answers complex queries, and cites exact references from your files.</p>
                <p>Whether you are analyzing lengthy financial reports, research papers, or legal agreements, AI Chat cuts down reading time and gives you precise insights instantly.</p>
            </Section>
        </ContentPage>
    );
}
