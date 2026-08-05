import { ParseResult } from "../parser";
import { CleanerResult } from "../cleaner";
import { ChunkingResult } from "../chunking";
import { EmbeddingResult } from "../embeddings";
import { VectorDBResult } from "../vectordb";
export interface PipelineResult {
  parser: ParseResult;
  cleaner: CleanerResult;
  chunker: ChunkingResult;
  embeddings: EmbeddingResult[];
  vectordb: VectorDBResult;
}