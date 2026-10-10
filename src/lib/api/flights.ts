import { postSearch, type SearchResponse } from "./shared";
import type { FlightResult } from "./types";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departure_date?: string;
  travellers?: number;
}

/** Live-only: no sample inventory. Failures throw — callers show retry + assisted enquiry. */
export async function searchFlights(params: FlightSearchParams): Promise<SearchResponse<FlightResult>> {
  const env = await postSearch<FlightResult>("/search/flights", { ...params });
  return { results: env.results, meta: env.meta };
}
