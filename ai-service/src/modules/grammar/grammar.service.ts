import { retrieveRelevantChunks } from "../retriever";
import { generateAnswer } from "../generator";
import { GrammarResult } from "./grammar.types";

export async function checkGrammar(): Promise<GrammarResult> {
  const retriever = await retrieveRelevantChunks(
    "Retrieve the complete document for grammar and spelling correction.",
    20
  );

 const generator = await generateAnswer(
  `You are an expert English grammar and spelling editor.

Correct:
- Grammar mistakes
- Spelling mistakes
- Punctuation errors
- Capitalization errors

Rules:
- Preserve the original meaning.
- Preserve headings.
- Preserve paragraph structure.
- Preserve formatting as much as possible.
- Correct grammar only.
- Correct spelling only.
- Correct punctuation only.
- Correct capitalization only.
- Do NOT summarize.
- Do NOT rewrite for style.
- Do NOT shorten sentences.
- Do NOT expand sentences.
- Do NOT remove any information.
- Return ONLY the corrected text.`,
  retriever.chunks
);
 return {
 correctionsMade: 0,
  correctedText: generator.answer,
  downloadable: true,
};
}