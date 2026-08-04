import type { Metadata } from "next";
import { ToolsHub } from "@/components/tools/tools-hub";

export const metadata: Metadata = {
    title: "All Tools | PDFAI",
    description: "Every PDF tool in one place — convert, edit, organise and secure your documents.",
};

// Next 16 passes searchParams as a Promise. Reading it here (rather than with
// useSearchParams in the client) keeps the tool grid in the server-rendered
// HTML instead of hiding it behind a Suspense fallback.
export default async function ToolsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string | string[] }>;
}) {
    const { category } = await searchParams;

    return <ToolsHub initialCategory={Array.isArray(category) ? category[0] : category} />;
}
