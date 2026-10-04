import { apiRequest, isBackendConfigured } from "./client";
import type { CabOffer, FlightOffer, HotelOffer, TrainOffer } from "./types";
import { MOCK_FLIGHTS } from "@/data/mockFlights";
import { MOCK_TRAINS } from "@/data/mockTrains";
import { MOCK_CABS } from "@/data/mockCabs";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departure_date?: string;
  travellers?: number;
}

function toFlightOffer(f: (typeof MOCK_FLIGHTS)[number]): FlightOffer {
  const [h, m] = f.duration.split("h").map((s) => parseInt(s, 10) || 0);
  return {
    id: f.id,
    provider: "demo",
    airline: f.airline,
    flight_number: f.flightNumber,
    origin: f.fromCode,
    destination: f.toCode,
    departure: f.departure,
    arrival: f.arrival,
    duration_minutes: h * 60 + m,
    stops: f.stops === "Non-stop" ? 0 : 1,
    baggage_kg: parseInt(f.baggage, 10) || 15,
    fare: f.price,
    currency: "INR",
    refundable: f.refundable,
    seat_available: true,
    is_demo: true,
  };
}

export const searchApi = {
  async flights(params: FlightSearchParams): Promise<{ results: FlightOffer[] }> {
    if (!isBackendConfigured()) {
      return { results: MOCK_FLIGHTS.slice(0, 4).map(toFlightOffer) };
    }
    return apiRequest<{ results: FlightOffer[] }>("/search/flights", {
      method: "POST",
      body: JSON.stringify({ type: "flight", ...params }),
    });
  },

  async trains(params: { origin: string; destination: string; departure_date?: string }): Promise<{ results: TrainOffer[] }> {
    if (!isBackendConfigured()) {
      return {
        results: MOCK_TRAINS.map((t) => ({
          id: `${t.id}-${t.classes[0]?.type ?? "3A"}`,
          provider: "demo",
          train_number: t.number,
          train_name: t.name,
          origin: t.fromCode,
          destination: t.toCode,
          departure: t.departure,
          arrival: t.arrival,
          duration_minutes: 1075,
          travel_class: t.classes[0]?.type ?? "3A",
          fare: t.classes[0]?.price ?? 0,
          currency: "INR",
          availability: t.classes[0]?.availability ?? "Available",
          running_days: t.days,
          is_demo: true,
        })),
      };
    }
    return apiRequest("/search/trains", { method: "POST", body: JSON.stringify({ type: "train", ...params }) });
  },

  async cabs(params: { origin: string; destination: string }): Promise<{ results: CabOffer[] }> {
    if (!isBackendConfigured()) {
      return {
        results: MOCK_CABS.map((c) => ({
          id: c.id,
          provider: "demo",
          vehicle_type: c.type,
          vehicle_model: c.name,
          capacity: c.capacity,
          luggage: 2,
          included_km: c.includedKm,
          extra_km_price: c.extraKm,
          driver_rating: c.driverRating,
          price: c.price,
          currency: "INR",
          cancellation_policy: c.cancellationPolicy,
          is_demo: true,
        })),
      };
    }
    return apiRequest("/search/cabs", { method: "POST", body: JSON.stringify({ type: "cab", ...params }) });
  },

  async hotels(params: { destination: string }): Promise<{ results: HotelOffer[] }> {
    if (!isBackendConfigured()) {
      // No local hotel dataset exists yet; return clearly-marked demo offers.
      return {
        results: [
          {
            id: "demo-hotel-gangtok-1",
            provider: "demo",
            name: "The Grand Himalaya",
            destination: params.destination || "Gangtok",
            location: "MG Marg",
            rating: 4.7,
            room_type: "Deluxe Room",
            amenities: ["WiFi", "Breakfast", "Heater"],
            price_per_night: 6800,
            total_price: 20400,
            currency: "INR",
            cancellation_policy: "Free cancellation",
            meal_plan: "Breakfast included",
            is_demo: true,
          },
        ],
      };
    }
    return apiRequest("/search/hotels", { method: "POST", body: JSON.stringify({ type: "hotel", ...params }) });
  },
};
