import { env } from "../../config/env";
import { VectorDBResult } from "./vectordb.types";
import { ChromaClient, type Metadata } from "chromadb";

const client = new ChromaClient({
  host: env.CHROMA_HOST,
  port: env.CHROMA_PORT,
  ssl: false,
});

/**
 * One Chroma collection per chat session, named from the session id.
 *
 * This is what makes chat multi-user safe: uploads and searches only ever
 * touch the caller's own collection, so two users (or two tabs) can never
 * read or destroy each other's documents.
 *
 * Chroma collection names must be 3–512 chars of [a-zA-Z0-9._-], starting
 * and ending alphanumeric — so the session id is sanitised, and prefixed
 * with "chat-" to guarantee a valid start whatever the id looks like.
 */
function collectionName(sessionId: string): string {
  const safe = sessionId.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100);
  return `chat-${safe || "default"}`;
}

export async function getCollection(sessionId: string) {
  return await client.getOrCreateCollection({
    name: collectionName(sessionId),
  });
}

/**
 * Drops the session's collection entirely. Called before re-ingesting a
 * document into the same session (replacing what that session had), and
 * usable later as a cleanup hook when a chat is deleted.
 */
export async function clearSession(sessionId: string) {
  try {
    await client.deleteCollection({ name: collectionName(sessionId) });
  } catch {
    // The collection may simply not exist yet — nothing to clear.
  }
}

export async function storeEmbeddings(
  sessionId: string,
  ids: string[],
  documents: string[],
  embeddings: number[][],
  metadatas?: Metadata[]
): Promise<VectorDBResult> {
  const collection = await getCollection(sessionId);

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
  sessionId: string,
  queryEmbedding: number[],
  topK: number = 5
) {
  const collection = await getCollection(sessionId);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  return results;
}