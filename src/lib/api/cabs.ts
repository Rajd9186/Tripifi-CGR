import { postSearch, type SearchResponse } from "./shared";
import type { CabResult } from "./types";

/** Live estimator only (computed fares, never sample inventory). Failures throw. */
export async function searchCabs(params: { origin: string; destination: string }): Promise<SearchResponse<CabResult>> {
  const env = await postSearch<CabResult>("/search/cabs", { ...params });
  return { results: env.results, meta: env.meta };
}
