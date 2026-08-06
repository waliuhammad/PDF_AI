import { ParseResult } from "../parser";
import { CleanerResult } from "../cleaner";
import { ChunkingResult } from "../chunking";
import { EmbeddingResult } from "../embeddings";
import { VectorDBResult } from "../vectordb";

/** Reading a PDF into text. Everything a tool needs that does not search the document. */
export interface ExtractionResult {
  parser: ParseResult;
  cleaner: CleanerResult;
  chunker: ChunkingResult;
}

/** Extraction plus the embeddings and vector store that retrieval needs. */
export interface PipelineResult extends ExtractionResult {
  embeddings: EmbeddingResult[];
  vectordb: VectorDBResult;
}
