export default function GrammarInfoPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-20 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight">Grammar</h1>
                <p className="text-xl text-muted-foreground">
                    Check grammar and spelling of your document.
                </p>
                <hr className="border-border" />
                <div className="prose prose-invert max-w-none space-y-4">
                    <p className="text-lg leading-relaxed">
                        Elevate your writing quality with our intelligent grammar and spelling checker. It thoroughly scans your documents to catch typos, grammatical errors, and stylistic issues instantly.
                    </p>
                    <p className="text-base text-muted-foreground">
                        Whether you are polishing professional emails, academic papers, or official reports, ensure your content is clear, concise, and error-free every single time.
                    </p>
                </div>
            </div>
        </main>
    );
}