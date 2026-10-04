import { backendReady, postSearch } from "./shared";
import type { HotelResult } from "./types";

export async function searchHotels(params: {
  destination: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
}): Promise<{ results: HotelResult[] }> {
  if (!backendReady()) return { results: [] };
  const env = await postSearch<HotelResult>("/search/hotels", {
    destination: params.destination,
    check_in: params.checkin,
    check_out: params.checkout,
    guests: params.guests ?? 2,
  });
  return { results: env.results };
}