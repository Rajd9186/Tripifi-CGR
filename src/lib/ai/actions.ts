"use client";

import type { UIAction } from "./types";

export interface ActionOutcome {
  ok: boolean;
  message: string;
  /** Client-side navigation target, if the action is a navigation. */
  href?: string;
}

interface TripItemLike {
  id: string;
  details?: Record<string, string>;
}

interface Store {
  ensureDraftTrip: (seed?: Record<string, string | number | undefined>) => { id: string; name: string };
  addItemToTrip: (tripId: string, item: Record<string, unknown>) => void;
  removeItemFromTrip: (tripId: string, itemId: string) => void;
  updateTrip: (id: string, updates: Record<string, unknown>) => void;
  updateTripItem: (tripId: string, itemId: string, updates: Record<string, unknown>) => void;
  toggleWishlist: (id: string) => void;
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

/**
 * Execute an AI action against the real trip store. Every action either
 * mutates state, navigates somewhere real, or honestly reports it can't.
 */
export function executeAction(action: UIAction, store: Store, items: TripItemLike[] = []): ActionOutcome {
  const payload = action.payload ?? {};
  const str = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);
  const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  try {
    switch (action.type) {
      case "CREATE_TRIP":
      case "OPEN_TRIP": {
        store.ensureDraftTrip({
          name: str(payload.name),
          origin: str(payload.origin),
          destination: str(payload.destination) ?? str(payload.destination_slug),
        });
        return { ok: true, message: "Trip ready in the Trip Builder.", href: "/plan" };
      }
      case "UPDATE_TRIP":
      case "UPDATE_BUDGET":
      case "CHANGE_BUDGET": {
        const trip = store.ensureDraftTrip({});
        const updates: Record<string, unknown> = {};
        if (num(payload.budget) !== undefined) updates.budget = payload.budget;
        if (num(payload.travellers) !== undefined) updates.travellers = payload.travellers;
        if (str(payload.name) !== undefined) updates.name = payload.name;
        if (Object.keys(updates).length === 0) {
          return { ok: true, message: "Open the Trip Builder to adjust the budget.", href: "/plan" };
        }
        store.updateTrip(trip.id, updates);
        return { ok: true, message: "Trip updated — see the new budget in the Trip Builder.", href: "/plan" };
      }
      case "CHANGE_DATE": {
        const trip = store.ensureDraftTrip({});
        const updates: Record<string, unknown> = {};
        if (str(payload.startDate)) updates.startDate = payload.startDate;
        if (str(payload.endDate)) updates.endDate = payload.endDate;
        if (Object.keys(updates).length === 0) {
          return { ok: true, message: "Open the Trip Builder to change dates.", href: "/plan" };
        }
        store.updateTrip(trip.id, updates);
        return { ok: true, message: "Dates updated.", href: "/plan" };
      }
      case "ADD_TRANSPORT":
      case "ADD_FLIGHT":
      case "ADD_CAB": {
        const trip = store.ensureDraftTrip({});
        const title = str(payload.title) ?? "Transport";
        store.addItemToTrip(trip.id, {
          type: action.type === "ADD_CAB" ? "cab" : "flight",
          title,
          date: str(payload.date) ?? "",
          amount: num(payload.amount) ?? 0,
          status: "upcoming",
          details: { Provider: "demo" },
        });
        return { ok: true, message: `Added ${title} to your trip.`, href: "/plan" };
      }
      case "ADD_HOTEL": {
        const trip = store.ensureDraftTrip({});
        const title = str(payload.name) ?? str(payload.title) ?? "Hotel";
        store.addItemToTrip(trip.id, {
          type: "hotel",
          title,
          date: "",
          amount: num(payload.amount) ?? num(payload.price_per_night) ?? 0,
          status: "upcoming",
          details: { Provider: "demo" },
        });
        return { ok: true, message: `Added ${title} to your trip.`, href: "/plan" };
      }
      case "ADD_ACTIVITY":
      case "ADD_DESTINATION": {
        const trip = store.ensureDraftTrip({});
        const title = str(payload.title) ?? str(payload.destination) ?? "Activity";
        store.addItemToTrip(trip.id, {
          type: "custom",
          title,
          date: "",
          amount: num(payload.amount) ?? num(payload.price) ?? 0,
          status: "upcoming",
          details: { Provider: "demo" },
        });
        return { ok: true, message: `Added ${title} to your trip.`, href: "/plan" };
      }
      case "MOVE_ITEM": {
        const id = str(payload.id ?? payload.item_id);
        const day = num(payload.day ?? payload.to_day);
        const trip = store.ensureDraftTrip({});
        const target = items.find((i) => i.id === id);
        if (!id || !day || !target) {
          return { ok: true, message: "Open the Trip Builder to place it on the right day.", href: "/plan" };
        }
        store.updateTripItem(trip.id, id, { details: { ...(target.details ?? {}), Day: `Day ${day}` } });
        return { ok: true, message: `Moved to Day ${day}.`, href: "/plan" };
      }
      case "REMOVE_ITEM": {
        return { ok: false, message: "Removal needs your confirmation first." };
      }
      case "SAVE_WISHLIST": {
        const id = str(payload.id ?? payload.slug ?? payload.destination);
        if (!id) return { ok: false, message: "I couldn't tell what to save." };
        store.toggleWishlist(id);
        return { ok: true, message: "Saved to your wishlist.", href: "/wishlist" };
      }
      case "OPEN_SEARCH": {
        const dest = str(payload.destination);
        return { ok: true, message: "Opening search.", href: dest ? `/destinations/${dest}` : "/destinations" };
      }
      case "OPTIMIZE_TRIP": {
        return { ok: true, message: "Opening your budget with savings options.", href: "/plan" };
      }
      case "REQUEST_BOOKING": {
        return { ok: true, message: "Opening booking assistance.", href: "/assistance?type=CUSTOM_TRIP" };
      }
      default:
        return { ok: false, message: `I can't do that yet (${action.type}). Nothing was changed.` };
    }
  } catch {
    return { ok: false, message: "I couldn't apply that just now. Nothing was changed to your trip." };
  }
}
