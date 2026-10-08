import { MOCK_CABS } from "@/data/mockCabs";
import { backendReady, postSearch, type SearchResponse } from "./shared";
import type { CabResult } from "./types";

function toResult(c: (typeof MOCK_CABS)[number]): CabResult {
  return {
    id: c.id,
    provider: "demo",
    status: "DEMO",
    vehicle_type: c.type,
    vehicle_model: c.name,
    vehicle: c.name,
    category: c.type,
    capacity: c.capacity,
    seats: c.capacity,
    luggage: 2,
    included_km: c.includedKm,
    extra_km_price: c.extraKm,
    driver_rating: c.driverRating,
    base_fare: c.price,
    toll_estimate: 0,
    taxes: 0,
    total_price: c.price,
    price: c.price,
    currency: "INR",
    cancellation_policy: c.cancellationPolicy,
    is_demo: true,
  };
}

export async function searchCabs(params: { origin: string; destination: string }): Promise<SearchResponse<CabResult>> {
  if (!backendReady()) {
    return {
      results: MOCK_CABS.map(toResult),
      meta: {
        mode: "ESTIMATE",
        source: "demo",
        provider: { name: "demo", status: "DEMO" },
        requestId: "local",
      },
    };
  }
  const env = await postSearch<CabResult>("/search/cabs", { ...params });
  return { results: env.results, meta: env.meta };
}
