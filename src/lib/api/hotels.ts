import { backendReady, postSearch, type SearchResponse } from "./shared";
import type { HotelResult } from "./types";

export async function searchHotels(params: {
  destination: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
}): Promise<SearchResponse<HotelResult>> {
  if (!backendReady()) return {
    results: [],
    meta: {
      mode: "ASSISTED",
      source: "demo",
      provider: { name: "demo", status: "DEMO" },
      requestId: "local",
    },
  };
  const env = await postSearch<HotelResult>("/search/hotels", {
    destination: params.destination,
    check_in: params.checkin,
    check_out: params.checkout,
    guests: params.guests ?? 2,
  });
  return { results: env.results, meta: env.meta };
}