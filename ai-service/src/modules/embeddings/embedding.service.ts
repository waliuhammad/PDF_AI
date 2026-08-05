import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { EmbeddingResult } from "./embedding.types";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

export async function generateEmbedding(
  text: string
): Promise<EmbeddingResult> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Failed to generate embedding.");
  }

  return {
    success: true,
    embedding,
    dimensions: embedding.length,
  };
}