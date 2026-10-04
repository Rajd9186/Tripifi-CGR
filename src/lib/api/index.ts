import { apiRequest, isBackendConfigured } from "./client";
import type { PricingSnapshot, TripDTO } from "./types";

export const tripsApi = {
  async list(): Promise<TripDTO[]> {
    if (!isBackendConfigured()) return [];
    return apiRequest<TripDTO[]>("/trips");
  },

  async create(input: { name: string; origin?: string; travellers?: number }): Promise<TripDTO> {
    if (!isBackendConfigured()) {
      // Local draft so the Trip Builder keeps working with no backend.
      return {
        id: `local-${Date.now()}`,
        name: input.name,
        origin: input.origin ?? null,
        start_date: null,
        end_date: null,
        travellers: input.travellers ?? 2,
        status: "DRAFT",
        total_amount: 0,
        currency: "INR",
        created_at: new Date().toISOString(),
      };
    }
    return apiRequest<TripDTO>("/trips", { method: "POST", body: JSON.stringify(input) });
  },

  async get(id: string): Promise<TripDTO> {
    return apiRequest<TripDTO>(`/trips/${id}`);
  },

  async price(id: string): Promise<PricingSnapshot> {
    return apiRequest<PricingSnapshot>(`/trips/${id}/price`);
  },
};

export const bookingsApi = {
  async create(tripId: string, idempotencyKey?: string) {
    return apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify({ trip_id: tripId, idempotency_key: idempotencyKey }),
      idempotencyKey,
    });
  },
};

export const paymentsApi = {
  async create(bookingId: string, method: string, idempotencyKey?: string) {
    return apiRequest("/payments", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId, method, idempotency_key: idempotencyKey }),
      idempotencyKey,
    });
  },
};

export const wishlistApi = {
  async list(): Promise<Array<{ id: string; item_type: string; item_id: string }>> {
    if (!isBackendConfigured()) return [];
    return apiRequest("/wishlist");
  },
};

export const aiApi = {
  async chat(message: string, tripId?: string) {
    if (!isBackendConfigured()) {
      const { MOCK_PACKAGES } = await import("@/data/mockPackages");
      const pkg = MOCK_PACKAGES[0];
      return {
        message: `Demo plan: ${pkg?.title ?? "Sikkim Escape"} fits a 6-day, 2-traveller brief. Connect the AI backend for live planning.`,
        trip_plan: { destination: "Sikkim", duration: 6, estimated_budget: 47800 },
        actions: [{ type: "ADD_DESTINATION", payload: { destination_slug: "sikkim" } }],
        is_demo: true,
      };
    }
    const { apiRequest: req } = await import("./client");
    return req("/ai/chat", { method: "POST", body: JSON.stringify({ message, trip_id: tripId }) });
  },
};
