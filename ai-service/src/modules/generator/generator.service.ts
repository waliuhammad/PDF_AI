import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { RetrievedChunk } from "../retriever";
import { GeneratorResult } from "./generator.types";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

export async function generateAnswer(
  question: string,
  chunks: RetrievedChunk[]
): Promise<GeneratorResult> {

  const context = chunks
    .map((chunk) => chunk.content)
    .join("\n\n---------------------\n\n");

  const prompt = `
You are a helpful AI assistant.

Answer ONLY using the provided context.

If the answer cannot be found in the context, reply exactly:

"I couldn't find the answer in the uploaded PDF."

Context:
${context}

Question:
${question}
`;

  const response = await ai.models.generateContent({
   model: env.GEMINI_MODEL,
    contents: prompt,
  });

  return {
    answer: response.text ?? "",
  };
}