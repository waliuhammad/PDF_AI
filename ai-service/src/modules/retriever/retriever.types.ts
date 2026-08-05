export interface RetrievedChunk {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface RetrieverResult {
  chunks: RetrievedChunk[];
  totalFound: number;
}