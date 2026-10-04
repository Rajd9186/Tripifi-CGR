import { MOCK_TRAINS } from "@/data/mockTrains";
import { backendReady, postSearch } from "./shared";
import type { TrainResult } from "./types";

function toResult(t: (typeof MOCK_TRAINS)[number]): TrainResult {
  const cls = t.classes[0];
  return {
    id: `${t.id}-${cls?.type ?? "3A"}`,
    provider: "demo",
    status: "DEMO",
    train_number: t.number,
    train_name: t.name,
    origin: t.fromCode,
    destination: t.toCode,
    departure: t.departure,
    arrival: t.arrival,
    duration_minutes: 1075,
    travel_class: cls?.type ?? "3A",
    fare: cls?.price ?? 0,
    price: cls?.price ?? 0,
    currency: "INR",
    availability: cls?.availability ?? "Available",
    running_days: t.days,
    is_demo: true,
  };
}

export async function searchTrains(params: { origin: string; destination: string; departure_date?: string }): Promise<{ results: TrainResult[] }> {
  if (!backendReady()) {
    return { results: MOCK_TRAINS.map(toResult) };
  }
  const env = await postSearch<TrainResult>("/search/trains", { ...params });
  return { results: env.results };
}
