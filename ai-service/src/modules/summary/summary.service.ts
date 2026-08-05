import { retrieveRelevantChunks } from "../retriever";
import { generateAnswer } from "../generator";
import { SummaryResult } from "./summary.types";

export async function generateSummary(): Promise<SummaryResult> {
  const retriever = await retrieveRelevantChunks(
    "Provide a complete summary of this document.",
    8
  );

  const generator = await generateAnswer(
    `Summarize the uploaded PDF.

Requirements:
- Produce a concise summary.
- Include the main topics.
- Highlight important information.
- Use bullet points when appropriate.`,
    retriever.chunks
  );

  return {
    summary: generator.answer,
  };
}