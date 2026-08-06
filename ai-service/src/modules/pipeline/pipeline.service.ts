import { parsePDF } from "../parser";
import { cleanText } from "../cleaner";
import { chunkText } from "../chunking";
import { ExtractionResult, PipelineResult } from "./pipeline.types";
import { generateEmbedding } from "../embeddings";
import {
  clearCollection,
  storeEmbeddings,
} from "../vectordb";

/**
 * Read a PDF into text. No embeddings, no vector store, so no Chroma server —
 * which is all a tool needs when it works on the whole document rather than
 * searching it.
 */
export async function extractText(
  buffer: Buffer
): Promise<ExtractionResult> {
  const parser = await parsePDF(buffer);

  const cleaner = cleanText(parser.text);

  const chunker = await chunkText(cleaner.cleanedText);

  return { parser, cleaner, chunker };
}

/**
 * Extraction plus embedding and storage, for retrieval-backed chat.
 *
 * Note that clearCollection() wipes the whole collection first, so only one
 * document is searchable at a time and a second upload discards the first.
 */
export async function processPDF(
  buffer: Buffer
): Promise<PipelineResult> {
  const extraction = await extractText(buffer);

  const embeddings = await Promise.all(
    extraction.chunker.chunks.map((chunk) => generateEmbedding(chunk.content))
  );

  // Remove previous PDF chunks (development mode)
  await clearCollection();

  const vectordb = await storeEmbeddings(
    extraction.chunker.chunks.map((chunk) => `chunk-${chunk.id}`),

    extraction.chunker.chunks.map((chunk) => chunk.content),

    embeddings.map((item) => item.embedding),

    extraction.chunker.chunks.map((chunk) => ({
      chunkId: chunk.id,
    }))
  );

  return {
    ...extraction,
    embeddings,
    vectordb,
  };
}
