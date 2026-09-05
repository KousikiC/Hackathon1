// Server-only module — do NOT import this in client components.
// It uses the Pinecone SDK which depends on Node.js built-ins (fs, path, stream).
import "server-only";
import { Pinecone } from "@pinecone-database/pinecone";

export interface SkillVector {
  id: string;
  skill: string;
  category: string;
  description: string;
}

export interface SkillMatchResult {
  skill: string;
  score: number;
  category: string;
  description: string;
}

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY environment variable is not set");
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

export async function querySkillMatches(
  queryEmbedding: number[],
  targetRole: string,
  topK = 10
): Promise<SkillMatchResult[]> {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME ?? "skillup-skills";
  const index = client.index(indexName);

  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK,
    filter: { role: { $eq: targetRole } },
    includeMetadata: true,
  });

  return (queryResponse.matches ?? []).map((match) => ({
    skill: String(match.metadata?.skill ?? ""),
    score: match.score ?? 0,
    category: String(match.metadata?.category ?? ""),
    description: String(match.metadata?.description ?? ""),
  }));
}

export async function upsertSkillVectors(
  vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, string>;
  }>
): Promise<void> {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME ?? "skillup-skills";
  const index = client.index(indexName);
  await index.upsert({ records: vectors });
}

// Re-export static data from the shared module so server-side API routes
// can reference it alongside the Pinecone client.
export { ROLE_SKILL_REQUIREMENTS } from "@/lib/skills-data";
