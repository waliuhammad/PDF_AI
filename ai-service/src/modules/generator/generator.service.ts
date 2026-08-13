import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { GeneratorResult } from "./generator.types";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

/**
 * Thrown when Gemini itself rejects the request for rate or quota reasons.
 *
 * This is not the user's plan allowance, and the message used to say it was
 * — "Daily AI usage limit reached" on a plan with plenty of operations left,
 * which reads as a billing problem and sends people to the pricing page for
 * something upgrading cannot fix. The free Gemini tier limits requests per
 * minute as well as per day, so a few AI tools in quick succession can trip it
 * while the plan is barely touched. The wording now says whose limit it is and
 * that waiting is what helps.
 */
export class AIQuotaError extends Error {
  status = 429;
  constructor(
    message = "The AI provider is rate-limiting us right now — this is not your plan's limit. Please wait a minute and try again."
  ) {
    super(message);
    this.name = "AIQuotaError";
  }
}

/** Gemini reports a spent quota in more than one shape depending on where it
 *  fails, so all three are checked. Taking unknown keeps the reads guarded. */
function isQuotaError(error: unknown): boolean {
  const e = error as { status?: number; error?: { code?: number; status?: string } } | null;
  return (
    e?.status === 429 ||
    e?.error?.code === 429 ||
    e?.error?.status === "RESOURCE_EXHAUSTED"
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
  } catch (error) {
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