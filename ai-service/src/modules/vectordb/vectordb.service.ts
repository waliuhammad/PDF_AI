import { env } from "../../config/env";
import { VectorDBResult } from "./vectordb.types";
import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: env.CHROMA_HOST,
  port: env.CHROMA_PORT,
  ssl: false,
});
export async function getCollection() {
  return await client.getOrCreateCollection({
    name: "pdf_chunks",
  });
}
export async function clearCollection() {
  const collection = await getCollection();

  const all = await collection.get();

  if (all.ids.length > 0) {
    await collection.delete({
      ids: all.ids,
    });
  }
}
export async function storeEmbeddings(
  ids: string[],
  documents: string[],
  embeddings: number[][],
  metadatas?: Record<string, any>[]
): Promise<VectorDBResult> 
 {
  const collection = await getCollection();

  await collection.add({
    ids,
    documents,
    embeddings,
    metadatas,
  });

  return {
    success: true,
    totalStored: ids.length,
  };
}
export async function searchSimilarChunks(
  queryEmbedding: number[],
  topK: number = 5
) {
  const collection = await getCollection();

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  return results;
}