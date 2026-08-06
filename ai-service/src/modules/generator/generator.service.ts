import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { RetrievedChunk } from "../retriever";
import { GeneratorResult } from "./generator.types";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

const CHUNK_SEPARATOR = "\n\n---------------------\n\n";

/** Thrown when the Gemini API rejects a request due to rate/quota limits. */
export class AIQuotaError extends Error {
  status = 429;
  constructor(
    message = "Daily AI usage limit reached. Please try again later."
  ) {
    super(message);
    this.name = "AIQuotaError";
  }
}

/** Join retrieved chunks into the context string generateAnswer expects. */
export function joinChunks(chunks: RetrievedChunk[]): string {
  return chunks.map((chunk) => chunk.content).join(CHUNK_SEPARATOR);
}

function isQuotaError(error: any): boolean {
  return (
    error?.status === 429 ||
    error?.error?.code === 429 ||
    error?.error?.status === "RESOURCE_EXHAUSTED"
  );
}

async function callGemini(prompt: string): Promise<GeneratorResult> {
  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
    });

    return {
      answer: response.text ?? "",
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);

    if (isQuotaError(error)) {
      throw new AIQuotaError();
    }

    throw new Error(
      "The AI service is temporarily busy. Please try again in a few seconds."
    );
  }
}

/**
 * Answer a question from retrieved context. Refuses when the context does not
 * contain the answer, which is what you want for chat and nothing else.
 */
export async function generateAnswer(
  question: string,
  context: string
): Promise<GeneratorResult> {
  return callGemini(`
You are a helpful AI assistant.
Answer ONLY using the provided context.

If the answer cannot be found in the context, reply exactly:
"I couldn't find the answer in the uploaded PDF."

Context:
${context}

Question:
${question}
`);
}

/**
 * Run an instruction over a whole document — summarise it, translate it,
 * correct it.
 *
 * Deliberately not generateAnswer: these are transformations, not questions,
 * and under the question-answering prompt Gemini treats "translate this" as
 * unanswerable and returns the "I couldn't find the answer" refusal instead of
 * the translation.
 */
export async function generateFromDocument(
  instruction: string,
  documentText: string
): Promise<GeneratorResult> {
  return callGemini(`
You are a document processing assistant.
Apply the following instruction to the document below and return only the result.

Instruction:
${instruction}

Document:
${documentText}
`);
}