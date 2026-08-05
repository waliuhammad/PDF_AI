import { parsePDF } from "../parser";
import { cleanText } from "../cleaner";
import { chunkText } from "../chunking";
import { PipelineResult } from "./pipeline.types";
import { generateEmbedding } from "../embeddings";
import {
  clearCollection,
  storeEmbeddings,
} from "../vectordb";

export async function processPDF(
  buffer: Buffer
): Promise<PipelineResult> {
  const parser = await parsePDF(buffer);

  const cleaner = cleanText(parser.text);

  const chunker = await chunkText(cleaner.cleanedText);

  const embeddings = await Promise.all(
    chunker.chunks.map((chunk) => generateEmbedding(chunk.content))
  );

  // Remove previous PDF chunks (development mode)
  await clearCollection();

  const vectordb = await storeEmbeddings(
    chunker.chunks.map((chunk) => `chunk-${chunk.id}`),

    chunker.chunks.map((chunk) => chunk.content),

    embeddings.map((item) => item.embedding),

    chunker.chunks.map((chunk) => ({
      chunkId: chunk.id,
    }))
  );

  return {
    parser,
    cleaner,
    chunker,
    embeddings,
    vectordb,
  };
}