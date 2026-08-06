export default function AISummaryInfoPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-20 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight">AI Summary</h1>
                <p className="text-xl text-muted-foreground">
                    Generate concise summaries from lengthy reports, books and documents.
                </p>
                <hr className="border-border" />
                <div className="prose prose-invert max-w-none space-y-4">
                    <p className="text-lg leading-relaxed">
                        Save hours of reading time. The AI Summary tool scans massive documents and instantly condenses key points, executive summaries, and action items into a clean overview.
                    </p>
                    <p className="text-base text-muted-foreground">
                        Whether you are reviewing academic papers, extensive contracts, or industry reports, AI Summary extracts the most vital details so you can grasp the core content in seconds.
                    </p>
                </div>
            </div>
        </main>
    );
}