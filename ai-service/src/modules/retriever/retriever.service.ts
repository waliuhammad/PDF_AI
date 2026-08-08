import { generateEmbedding } from "../embeddings";
import { searchSimilarChunks } from "../vectordb";
import { RetrieverResult } from "./retriever.types";

export async function retrieveRelevantChunks(
  question: string,
  sessionId: string,
  topK: number = 5
): Promise<RetrieverResult> {

  // Generate embedding for the user's question
  const queryEmbedding = await generateEmbedding(question);

  // Search only this session's collection in ChromaDB
  const results = await searchSimilarChunks(
    sessionId,
    queryEmbedding.embedding,
    topK
  );

  return {
    chunks:
      results.documents?.[0]?.map((doc, index) => ({
        id: results.ids?.[0]?.[index] ?? "",
        content: doc ?? "",
        metadata: results.metadatas?.[0]?.[index] ?? undefined,
      })) ?? [],

    totalFound: results.documents?.[0]?.length ?? 0,
  };
}