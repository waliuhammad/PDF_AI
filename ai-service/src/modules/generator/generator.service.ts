import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { RetrievedChunk } from "../retriever";
import { GeneratorResult } from "./generator.types";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

const CHUNK_SEPARATOR = "\n\n---------------------\n\n";

/** Join retrieved chunks into the context string generateAnswer expects. */
export function joinChunks(chunks: RetrievedChunk[]): string {
  return chunks.map((chunk) => chunk.content).join(CHUNK_SEPARATOR);
}

/**
 * Gemini turned the request away for now rather than failing.
 *
 * Worth its own type: the routes were reporting a rate limit as a 500 with
 * "Summary generation failed.", which tells the user their document is the
 * problem when the fix is to wait a moment.
 */
export class AiBusyError extends Error {
  readonly retryAfterSeconds?: number;

  constructor(message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "AiBusyError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** 429 is the quota/rate limit; 503 is Google being unavailable. Both pass. */
function busyRetryDelay(error: unknown): number | null {
  const status = (error as { status?: number })?.status;
  if (status !== 429 && status !== 503) return null;

  // The SDK carries the server's suggested delay as "retryDelay": "15s".
  const match = JSON.stringify(error ?? "").match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  return match ? Math.ceil(Number(match[1])) : 0;
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
  } catch (error) {
    console.error("Gemini Error:", error);

    const delay = busyRetryDelay(error);
    if (delay !== null) {
      throw new AiBusyError(
        delay > 0
          ? `The AI service is busy. Please try again in about ${delay} seconds.`
          : "The AI service is busy. Please try again in a few seconds.",
        delay || undefined
      );
    }

    throw new Error("The AI service could not process this document.");
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