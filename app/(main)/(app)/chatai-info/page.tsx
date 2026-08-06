export default function ChatAIInfoPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-20 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight">AI Chat</h1>
                <p className="text-xl text-muted-foreground">
                    Ask questions about any PDF and receive accurate answers instantly.
                </p>
                <hr className="border-border" />
                <div className="prose prose-invert max-w-none space-y-4">
                    <p className="text-lg leading-relaxed">
                        Our AI Chat feature allows you to converse directly with your documents. Using advanced language models, it extracts context, answers complex queries, and cites exact references from your files.
                    </p>
                    <p className="text-base text-muted-foreground">
                        Whether you are analyzing lengthy financial reports, research papers, or legal agreements, AI Chat cuts down reading time and gives you precise insights instantly.
                    </p>
                </div>
            </div>
        </main>
    );
}