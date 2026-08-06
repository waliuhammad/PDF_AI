export default function OCRScannerInfoPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-20 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight">OCR Scanner</h1>
                <p className="text-xl text-muted-foreground">
                    Convert scanned PDFs and images into fully editable searchable text.
                </p>
                <hr className="border-border" />
                <div className="prose prose-invert max-w-none space-y-4">
                    <p className="text-lg leading-relaxed">
                        Our advanced OCR (Optical Character Recognition) scanner transforms static images and non-searchable scanned PDFs into fully editable, selectable text documents with high accuracy.
                    </p>
                    <p className="text-base text-muted-foreground">
                        Extract text seamlessly from receipts, scanned certificates, or legacy documents, making your physical archives completely searchable and digital-ready in seconds.
                    </p>
                </div>
            </div>
        </main>
    );
}