import { MOCK_FLIGHTS } from "@/data/mockFlights";
import { backendReady, postSearch } from "./shared";
import type { FlightResult } from "./types";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departure_date?: string;
  travellers?: number;
}

function toResult(f: (typeof MOCK_FLIGHTS)[number]): FlightResult {
  const [h, m] = f.duration.split("h").map((s) => parseInt(s, 10) || 0);
  return {
    id: f.id,
    provider: "demo",
    status: "DEMO",
    airline: f.airline,
    flight_number: f.flightNumber,
    origin: f.fromCode,
    destination: f.toCode,
    departure: f.departure,
    arrival: f.arrival,
    duration_minutes: h * 60 + m,
    stops: f.stops === "Non-stop" ? 0 : 1,
    cabin: f.classType,
    baggage_kg: parseInt(f.baggage, 10) || 15,
    fare: f.price,
    price: f.price,
    currency: "INR",
    refundable: f.refundable,
    seat_available: true,
    is_demo: true,
  };
}

export async function searchFlights(params: FlightSearchParams): Promise<{ results: FlightResult[] }> {
  if (!backendReady()) return { results: MOCK_FLIGHTS.slice(0, 4).map(toResult) };
  const env = await postSearch<FlightResult>("/search/flights", { ...params });
  return { results: env.results };
}
