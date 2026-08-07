import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { EmbeddingResult } from "./embedding.types";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

const MODEL = "gemini-embedding-2";

/** The API takes many inputs per call, but not unlimited. */
const BATCH_SIZE = 100;

/** One piece of text — the retriever embedding a question. */
export async function generateEmbedding(
  text: string
): Promise<EmbeddingResult> {
  const [result] = await generateEmbeddings([text]);
  return result;
}

/**
 * Many pieces of text in as few calls as possible.
 *
 * The pipeline used to map generateEmbedding over every chunk, so a 20-page
 * PDF meant about 160 separate requests for a single upload — slow, and 160
 * times the quota. embedContent accepts a list, so this sends them in batches
 * of a hundred instead.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<EmbeddingResult[]> {
  if (texts.length === 0) return [];

  const out: EmbeddingResult[] = [];

  for (let start = 0; start < texts.length; start += BATCH_SIZE) {
    const batch = texts.slice(start, start + BATCH_SIZE);

    const response = await ai.models.embedContent({
      model: MODEL,
      // Each entry has to be its own Content. A plain string[] is read as one
      // content made of many parts, and comes back as a single embedding.
      contents: batch.map((text) => ({ parts: [{ text }] })),
    });

    const embeddings = response.embeddings ?? [];

    if (embeddings.length !== batch.length) {
      throw new Error(
        `Expected ${batch.length} embeddings but received ${embeddings.length}.`
      );
    }

    for (const item of embeddings) {
      const values = item?.values;
      if (!values) throw new Error("Failed to generate embedding.");

      out.push({
        success: true,
        embedding: values,
        dimensions: values.length,
      });
    }
  }

  return out;
}
