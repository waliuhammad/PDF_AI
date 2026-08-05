import { retrieveRelevantChunks } from "../retriever";
import { generateAnswer } from "../generator";
import { TranslateResult } from "./translate.types";

export async function translateDocument(
  language: string
): Promise<TranslateResult> {

  const retriever = await retrieveRelevantChunks(
    "Provide the complete document.",
    20
  );

  const generator = await generateAnswer(
    `Translate the uploaded PDF into ${language}.

Rules:
- Translate the entire document.
- Preserve headings and formatting where possible.
- Do not summarize.
- Do not omit any information.
- Return only the translated text.`,
    retriever.chunks
  );

  return {
    language,
    translatedText: generator.answer,
    downloadable: true,
  };
}