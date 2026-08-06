export default function TranslatePDFInfoPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-20 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight">Translate PDF</h1>
                <p className="text-xl text-muted-foreground">
                    Translate documents into multiple languages while preserving formatting.
                </p>
                <hr className="border-border" />
                <div className="prose prose-invert max-w-none space-y-4">
                    <p className="text-lg leading-relaxed">
                        Break down language barriers with our AI-powered document translator. Translate your PDFs, reports, and manuals into dozens of global languages instantly.
                    </p>
                    <p className="text-base text-muted-foreground">
                        Our translation tool maintains your document's original structure, layout, and formatting, ensuring professional results whether for business, academics, or personal use.
                    </p>
                </div>
            </div>
        </main>
    );
}