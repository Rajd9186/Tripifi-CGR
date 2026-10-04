import { apiRequest, isBackendConfigured } from "./client";

export const geoApi = {
  async geocode(query: string, limit = 5) {
    if (!isBackendConfigured()) {
      return { results: [], is_demo: true, note: "Geocoding requires backend" };
    }
    return apiRequest("/geo/geocode", { method: "POST", body: JSON.stringify({ query, limit }), auth: false });
  },

  async route(origin: string, destination: string, opts: { vehicle?: string; trip_type?: string; tolls?: number; night_halt?: boolean } = {}) {
    if (!isBackendConfigured()) {
      return {
        route: { distance_km: 0, duration_minutes: 0, provider: "none", is_demo: true },
        fare_estimate: null,
        note: "Routing requires backend",
      };
    }
    return apiRequest("/geo/route", { method: "POST", body: JSON.stringify({ origin, destination, ...opts }), auth: false });
  },

  async providersHealth() {
    if (!isBackendConfigured()) {
      return {
        providers: [
          { provider: "flight", mode: "demo", state: "NOT_CONFIGURED", bookable: false },
          { provider: "train", mode: "demo", state: "NOT_CONFIGURED", bookable: false },
          { provider: "hotel", mode: "demo", state: "NOT_CONFIGURED", bookable: false },
          { provider: "cab", mode: "tripifi", state: "SUCCESS", bookable: false },
          { provider: "routing", mode: "osrm", state: "NOT_CONFIGURED", bookable: false },
          { provider: "geocoding", mode: "nominatim", state: "NOT_CONFIGURED", bookable: false },
        ],
      };
    }
    return apiRequest("/geo/providers/health", { auth: false });
  },
};

/** Central capability decision: live flow only when legitimate; else assisted booking. */
export function bookingCapability(service: string, providerOk: boolean): { mode: "LIVE_RESULTS" | "ASSISTED_BOOKING"; bookable: boolean; enquiry: boolean } {
  const BOOKABLE: Record<string, boolean> = { flight: false, train: false, hotel: false, cab: false, package: true };
  const bookable = Boolean(BOOKABLE[service] && providerOk);
  return bookable
    ? { mode: "LIVE_RESULTS", bookable: true, enquiry: false }
    : { mode: "ASSISTED_BOOKING", bookable: false, enquiry: true };
}
