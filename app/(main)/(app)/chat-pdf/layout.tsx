import type { Metadata } from "next";

// The page itself is a client component and so cannot export metadata.
export const metadata: Metadata = {
    title: "Chat with PDF",
    description: "Ask questions about your documents. Part of PDFAI, usable without an account.",
    alternates: { canonical: "/chat-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
