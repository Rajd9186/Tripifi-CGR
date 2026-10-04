import { backendReady, postSearch } from "./shared";
import type { DestinationResult } from "./types";

export async function searchDestinations(params: {
  query?: string;
  themes?: string[];
  styles?: string[];
  budget?: number;
  days?: number;
  season?: string;
  region?: string;
  limit?: number;
}): Promise<{ results: DestinationResult[] }> {
  if (!backendReady()) return { results: [] };
  const env = await postSearch<DestinationResult>("/search/destinations", {
    ...params,
    limit: params.limit ?? 6,
  });
  return { results: env.results };
}

export async function getDestinationDetails(slug: string): Promise<DestinationResult | null> {
  const { results } = await searchDestinations({ query: slug, limit: 1 });
  return results[0] ?? null;
}