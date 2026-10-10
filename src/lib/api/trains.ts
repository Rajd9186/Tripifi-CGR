import { postSearch, type SearchResponse } from "./shared";
import type { TrainResult } from "./types";

/** Live-only: no sample timetable. Failures throw — callers show retry + assisted enquiry. */
export async function searchTrains(params: { origin: string; destination: string; departure_date?: string }): Promise<SearchResponse<TrainResult>> {
  const env = await postSearch<TrainResult>("/search/trains", { ...params });
  return { results: env.results, meta: env.meta };
}
