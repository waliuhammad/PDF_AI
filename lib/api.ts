// lib/api.ts
/**
 * Mock API service layer.
 * Every function mirrors a real API route (e.g. POST /api/tools/convert).
 * Components only call these — swap the mock body for fetch() later
 * and no component code has to change.
 */

export interface ApiFile {
    name: string;
    size: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Excel / PPT / PDF conversions ----------

export interface ConvertResult {
    downloadUrl: string;
}

export async function convertExcelToPdf(files: ApiFile[], sheets: Record<string, string[]>): Promise<ConvertResult> {
    await delay(1800);
    return { downloadUrl: "/mock/converted.pdf" };
}

export async function convertPptToPdf(files: ApiFile[]): Promise<ConvertResult> {
    await delay(1800);
    return { downloadUrl: "/mock/converted.pdf" };
}

export interface PdfToPptResult extends ConvertResult {
    slideCount: number;
}

export async function convertPdfToPpt(file: ApiFile): Promise<PdfToPptResult> {
    await delay(2000);
    return { downloadUrl: "/mock/converted.pptx", slideCount: Math.floor(Math.random() * 15) + 4 };
}

// ---------- Edit / Sign ----------

export interface PdfEdit {
    page: number;
    tool: string;
}

export async function savePdfEdits(file: ApiFile, edits: PdfEdit[]): Promise<ConvertResult> {
    await delay(1500);
    return { downloadUrl: "/mock/edited.pdf" };
}

export interface PdfSignature {
    page: number;
    x: number;
    y: number;
    text: string;
}

export async function submitPdfSignatures(file: ApiFile, signatures: PdfSignature[]): Promise<ConvertResult> {
    await delay(1500);
    return { downloadUrl: "/mock/signed.pdf" };
}

// ---------- Compress ----------

export type CompressionLevel = "low" | "recommended" | "extreme";

export interface CompressResult {
    downloadUrl: string;
    compressedBytes: number;
}

const REDUCTION_BY_LEVEL: Record<CompressionLevel, number> = {
    low: 0.15,
    recommended: 0.45,
    extreme: 0.7,
};

export async function compressPdf(fileBytes: number, level: CompressionLevel): Promise<CompressResult> {
    // Real version: return fetch("/api/pdf/compress", { method: "POST", body: JSON.stringify({ level }) })
    await delay(1800);
    return {
        downloadUrl: "/mock/compressed.pdf",
        compressedBytes: Math.round(fileBytes * (1 - REDUCTION_BY_LEVEL[level])),
    };
}

// ---------- AI tools ----------

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export async function sendPdfChatMessage(file: ApiFile, history: ChatMessage[], message: string): Promise<ChatMessage> {
    await delay(1200);
    return {
        role: "assistant",
        content: `Based on "${file.name}", here's what I found related to: "${message}". (Mock response — connect the AI backend to generate real answers.)`,
    };
}

export type SummaryLength = "short" | "medium" | "detailed";

export interface SummaryResult {
    keyPoints: string[];
}

export async function summarizePdf(file: ApiFile, length: SummaryLength): Promise<SummaryResult> {
    await delay(1800);
    const counts: Record<SummaryLength, number> = { short: 3, medium: 5, detailed: 8 };
    return {
        keyPoints: Array.from({ length: counts[length] }).map((_, i) => `Key point ${i + 1} from ${file.name} (mock summary content).`),
    };
}

export interface TranslateResult extends ConvertResult {
    previewText: string;
}

export async function translatePdf(file: ApiFile, targetLanguage: string): Promise<TranslateResult> {
    await delay(2000);
    return {
        downloadUrl: "/mock/translated.pdf",
        previewText: `[Mock preview of ${file.name} translated to ${targetLanguage}]`,
    };
}
// ---------- PDF to Image ----------

export type ImageFormat = "jpg" | "png" | "svg" | "webp";

export interface PdfToImageResult {
    downloadUrl: string;
    imageCount: number;
    format: ImageFormat;
}

export async function convertPdfToImages(file: ApiFile, format: ImageFormat): Promise<PdfToImageResult> {
    // Real version: return fetch("/api/convert/pdf-to-image", { method: "POST", body: JSON.stringify({ format }) })
    await delay(2000);
    return {
        downloadUrl: "/mock/converted-images.zip",
        imageCount: Math.floor(Math.random() * 10) + 2,
        format,
    };
}