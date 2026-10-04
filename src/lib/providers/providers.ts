/** Frontend provider abstraction. UI depends on these interfaces — never on vendor SDKs. */

import { searchApi } from "@/lib/api/search";
import type { CabOffer, FlightOffer, HotelOffer, TrainOffer } from "@/lib/api/types";

export type ProviderState = "LIVE" | "DEMO" | "UNAVAILABLE";

export interface ProviderResult<T> {
  results: T[];
  state: ProviderState;
  message?: string;
}

async function withFallback<T>(fn: () => Promise<{ results: T[] }>, demo: () => { results: T[] }): Promise<ProviderResult<T>> {
  try {
    const r = await fn();
    const isDemo = r.results.length > 0 && (r.results[0] as unknown as { is_demo?: boolean }).is_demo !== false;
    void isDemo;
    return { results: r.results, state: "DEMO", message: "Sample fare — live booking unavailable" };
  } catch {
    return { ...demo(), state: "UNAVAILABLE", message: "We couldn't retrieve live availability right now." };
  }
}

export interface FlightSearchInput {
  origin: string;
  destination: string;
  departure_date?: string;
  travellers?: number;
}

export const flightProvider = {
  async searchFlights(input: FlightSearchInput): Promise<ProviderResult<FlightOffer>> {
    return withFallback(
      () => searchApi.flights({ origin: input.origin, destination: input.destination, departure_date: input.departure_date, travellers: input.travellers ?? 2 }),
      () => ({ results: [] })
    );
  },
};

export const trainProvider = {
  async searchTrains(input: { origin: string; destination: string; departure_date?: string }): Promise<ProviderResult<TrainOffer>> {
    return withFallback(
      () => searchApi.trains({ origin: input.origin, destination: input.destination, departure_date: input.departure_date }),
      () => ({ results: [] })
    );
  },
};

export const cabProvider = {
  async searchCabs(input: { origin: string; destination: string }): Promise<ProviderResult<CabOffer>> {
    return withFallback(
      () => searchApi.cabs({ origin: input.origin, destination: input.destination }),
      () => ({ results: [] })
    );
  },
};

export const hotelProvider = {
  async searchHotels(input: { destination: string }): Promise<ProviderResult<HotelOffer>> {
    return withFallback(
      () => searchApi.hotels({ destination: input.destination }),
      () => ({ results: [] })
    );
  },
};
