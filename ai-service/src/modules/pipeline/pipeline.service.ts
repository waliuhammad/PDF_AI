import { parsePDF } from "../parser";
import { cleanText } from "../cleaner";
import { chunkText } from "../chunking";
import { ExtractionResult, PipelineResult } from "./pipeline.types";
import { generateEmbeddings } from "../embeddings";
import {
  clearSession,
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
 * Everything lands in the session's own collection: uploading replaces
 * only this session's previous document, and never touches anyone else's.
 */
export async function processPDF(
  buffer: Buffer,
  sessionId: string
): Promise<PipelineResult> {
  const extraction = await extractText(buffer);

  // One request per hundred chunks, not one per chunk.
  const embeddings = await generateEmbeddings(
    extraction.chunker.chunks.map((chunk) => chunk.content)
  );

  // Replace this session's previous document, if any.
  await clearSession(sessionId);

  const vectordb = await storeEmbeddings(
    sessionId,

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