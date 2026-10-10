import { postSearch, type SearchResponse } from "./shared";
import type { HotelResult } from "./types";

/** Live-only (Overpass listings). No sample inventory — failures throw. */
export async function searchHotels(params: {
  destination: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
}): Promise<SearchResponse<HotelResult>> {
  const env = await postSearch<HotelResult>("/search/hotels", {
    destination: params.destination,
    check_in: params.checkin,
    check_out: params.checkout,
    guests: params.guests ?? 2,
  });
  return { results: env.results, meta: env.meta };
}