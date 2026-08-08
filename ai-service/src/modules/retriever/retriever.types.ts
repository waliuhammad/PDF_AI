export interface RetrievedChunk {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface RetrieverResult {
  chunks: RetrievedChunk[];
  totalFound: number;
}