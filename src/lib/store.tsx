"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadLegacy, loadPersistedState, saveLegacy, savePersistedState } from "./persistence/tripStorage";

export type BookingType = "flight" | "train" | "cab" | "package" | "custom" | "hotel";
export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface Booking {
  id: string;
  type: BookingType;
  title: string;
  route?: string;
  date: string;
  amount: number;
  status: BookingStatus;
  createdAt: string;
  details: Record<string, string>;
  travellers?: { name: string; age: string; gender: string }[];
}

export interface SavedTraveller {
  id: string;
  name: string;
  dob: string;
  gender: string;
  idType: string;
  idNumber: string;
  passport: string;
  phone: string;
  email: string;
}

/** Trip types for unified journey state */
export type TripStatus = "draft" | "confirmed" | "completed" | "cancelled";

export interface TripItem {
  id: string;
  type: BookingType;
  title: string;
  route?: string;
  date: string;
  amount: number;
  status: BookingStatus;
  details: Record<string, string>;
  bookingId?: string; // Link to actual booking when confirmed
}

export interface Trip {
  id: string;
  name: string;
  title?: string;
  destination?: string;
  status: TripStatus;
  origin?: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  travellers: number;
  budget?: number;
  currency?: string;
  items: TripItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedTraveller {
  id: string;
  name: string;
  dob: string;
  gender: string;
  idType: string;
  idNumber: string;
  passport: string;
  phone: string;
  email: string;
}

export interface AppNotification {
  id: string;
  type: "booking" | "payment" | "reminder" | "change" | "refund";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface ToastMsg {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

/** Search state for persisting search params across navigation */
export interface SearchState {
  flights?: { from: string; to: string; departure: string; return?: string; travellers: string; class: string; tripType: string };
  trains?: { from: string; to: string; date: string; class: string; quota: string };
  cabs?: { pickup: string; drop: string; datetime: string; tripType: string; vehicle: string };
  hotels?: { destination: string; checkin: string; checkout: string; guests: string; rooms: string };
  packages?: { destination: string; budget: string; duration: string };
  build?: { plan: string };
}

interface AppState {
  user: { name: string; email: string } | null;
  login: (name?: string, email?: string) => void;
  logout: () => void;
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id" | "createdAt">) => string;
  cancelBooking: (id: string) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  notifications: AppNotification[];
  markAllRead: () => void;
  toasts: ToastMsg[];
  toast: (message: string, type?: ToastMsg["type"]) => void;
  dismissToast: (id: string) => void;
  travellers: SavedTraveller[];
  saveTraveller: (t: Omit<SavedTraveller, "id">) => void;
  removeTraveller: (id: string) => void;
  pendingPlan: string | null;
  setPendingPlan: (p: string | null) => void;
  /** Trip state */
  trips: Trip[];
  currentTrip: Trip | null;
  createTrip: (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  ensureDraftTrip: (seed?: { name?: string; origin?: string; destination?: string; startDate?: string; endDate?: string; travellers?: number }) => Trip;
  addItemToTrip: (tripId: string, item: Omit<TripItem, "id">) => void;
  removeItemFromTrip: (tripId: string, itemId: string) => void;
  updateTripItem: (tripId: string, itemId: string, updates: Partial<TripItem>) => void;
  /** Search state */
  searchState: SearchState;
  setSearchState: (state: Partial<SearchState>) => void;
  clearSearchState: (type?: keyof SearchState) => void;
  hydrated: boolean;
}

const Ctx = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T): T {
  return loadLegacy(key, fallback);
}

function save(key: string, value: unknown) {
  saveLegacy(key, value);
  // Mirror trip-relevant slices into the versioned state container.
  try {
    if (key === "yatraa_trips") savePersistedState({ trips: value });
    else if (key === "yatraa_wishlist") savePersistedState({ wishlist: value });
    else if (key === "yatraa_travellers") savePersistedState({ travellers: value });
    else if (key === "yatraa_bookings") savePersistedState({ bookings: value });
    else if (key === "yatraa_search_state") savePersistedState({ searchState: value });
  } catch {
    // Persistence must never break the product.
  }
}

const SEED_BOOKINGS: Booking[] = [
  {
    id: "YT-2026-1042",
    type: "flight",
    title: "Kolkata → Delhi · IndiGo 6E-2043",
    route: "CCU → DEL",
    date: "2026-12-12",
    amount: 11464,
    status: "upcoming",
    createdAt: "2026-09-28",
    details: {
      Airline: "IndiGo",
      Departure: "06:30 · Netaji Subhas Chandra Bose Intl (CCU)",
      Arrival: "08:55 · Indira Gandhi Intl (DEL)",
      Class: "Economy",
      Baggage: "15 kg check-in + 7 kg cabin",
      PNR: "Q9X2LB",
    },
  },
  {
    id: "YT-2026-1031",
    type: "package",
    title: "Sikkim Escape · Gangtok & Pelling",
    route: "NJP → Gangtok → Pelling → NJP",
    date: "2026-11-06",
    amount: 69998,
    status: "upcoming",
    createdAt: "2026-09-20",
    details: {
      Duration: "5 Nights / 6 Days",
      Hotel: "3-Star Deluxe",
      Travellers: "2 Adults",
      Inclusions: "Hotel, Breakfast, Private Cab, Sightseeing, Transfers",
    },
  },
  {
    id: "YT-2026-0918",
    type: "train",
    title: "Howrah Rajdhani 12301 · Kolkata → Delhi",
    route: "HWH → NDLS",
    date: "2026-08-15",
    amount: 6450,
    status: "completed",
    createdAt: "2026-07-30",
    details: { Class: "3A", Departure: "16:50", Arrival: "09:55 (+1)", Quota: "General" },
  },
  {
    id: "YT-2026-0804",
    type: "cab",
    title: "Kolkata → Digha · Swift Dzire",
    route: "Kolkata → Digha",
    date: "2026-07-04",
    amount: 3600,
    status: "cancelled",
    createdAt: "2026-06-28",
    details: { Vehicle: "Swift Dzire (Sedan)", Trip: "One Way", Refund: "₹3,240 refunded to UPI" },
  },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "booking",
    title: "Trip confirmed 🎉",
    body: "Your Sikkim Escape package (YT-2026-1031) is confirmed. Itinerary & vouchers are ready.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n2",
    type: "reminder",
    title: "Upcoming flight · 12 Dec",
    body: "Web check-in for IndiGo 6E-2043 (CCU → DEL) opens 48 hours before departure.",
    time: "1d ago",
    read: false,
  },
  {
    id: "n3",
    type: "payment",
    title: "Payment successful",
    body: "₹69,998 paid via UPI for booking YT-2026-1031. Invoice available to download.",
    time: "2d ago",
    read: true,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppState["user"]>(null);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [travellers, setTravellers] = useState<SavedTraveller[]>([]);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /** Trip state */
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [searchState, setSearchState] = useState<SearchState>({});

  /** Persist trips to localStorage */
  useEffect(() => {
    save("yatraa_trips", trips);
  }, [trips]);

  /** Persist search state to localStorage */
  useEffect(() => {
    save("yatraa_search_state", searchState);
  }, [searchState]);

  useEffect(() => {
    // Prefer the versioned container; fall back to legacy keys (migrated on read).
    const persisted = loadPersistedState();
    const savedUser = load<AppState["user"] | null>("yatraa_user", null);
    if (savedUser) setUser(savedUser);
    const b = (persisted?.bookings as Booking[] | undefined) ?? load<Booking[] | null>("yatraa_bookings", null);
    if (b) setBookings([...b, ...SEED_BOOKINGS]);
    const w = (persisted?.wishlist as string[] | undefined) ?? load<string[] | null>("yatraa_wishlist", null);
    if (w) setWishlist(w);
    const t = (persisted?.travellers as SavedTraveller[] | undefined) ?? load<SavedTraveller[] | null>("yatraa_travellers", null);
    if (t) setTravellers(t);

    // Load trips from localStorage
    const savedTrips = (persisted?.trips as Trip[] | undefined) ?? load<Trip[] | null>("yatraa_trips", null);
    if (savedTrips) setTrips(savedTrips);

    // Load search state
    const savedSearchState = (persisted?.searchState as SearchState | undefined) ?? load<SearchState | null>("yatraa_search_state", null);
    if (savedSearchState) setSearchState(savedSearchState);

    setHydrated(true);
  }, []);

  const toast = useCallback((message: string, type: ToastMsg["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const login = useCallback(
    (name = "Aarav Sharma", email = "aarav@yatraa.in") => {
      const u = { name, email };
      setUser(u);
      save("yatraa_user", u);
      toast("Welcome back, " + name.split(" ")[0] + "!");
    },
    [toast]
  );

  const logout = useCallback(() => {
    setUser(null);
    save("yatraa_user", null);
    toast("Signed out", "info");
  }, [toast]);

  const addBooking = useCallback(
    (b: Omit<Booking, "id" | "createdAt">) => {
      const id = `YT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const full: Booking = { ...b, id, createdAt: new Date().toISOString().slice(0, 10) };
      setBookings((prev) => {
        const next = [full, ...prev];
        const userBookings = next.filter((x) => !SEED_BOOKINGS.some((s) => s.id === x.id));
        save("yatraa_bookings", userBookings);
        return next;
      });
      setNotifications((prev) => {
        const next = [
          {
            id: Math.random().toString(36).slice(2),
            type: "booking" as const,
            title: "Trip confirmed 🎉",
            body: `${full.title} is confirmed (${full.id}). Vouchers are on their way to your email.`,
            time: "Just now",
            read: false,
          },
          ...prev,
        ];
        return next;
      });
      return id;
    },
    []
  );

  const cancelBooking = useCallback(
    (id: string) => {
      setBookings((prev) => {
        const next = prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b));
        const userBookings = next.filter((x) => !SEED_BOOKINGS.some((s) => s.id === x.id));
        save("yatraa_bookings", userBookings);
        return next;
      });
      setNotifications((prev) => [
        {
          id: Math.random().toString(36).slice(2),
          type: "refund" as const,
          title: "Cancellation & refund initiated",
          body: `Booking ${id} was cancelled. Refund as per policy will reflect in 5–7 business days.`,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);
      toast("Booking cancelled. Refund initiated.", "info");
    },
    [toast]
  );

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      save("yatraa_wishlist", next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), []);

  const saveTraveller = useCallback((t: Omit<SavedTraveller, "id">) => {
    setTravellers((prev) => {
      const next = [{ ...t, id: Math.random().toString(36).slice(2) }, ...prev];
      save("yatraa_travellers", next);
      return next;
    });
  }, []);

  const removeTraveller = useCallback((id: string) => {
    setTravellers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      save("yatraa_travellers", next);
      return next;
    });
  }, []);

  /** Trip management functions */
  const ensureDraftTrip = useCallback(
    (seed?: { name?: string; origin?: string; destination?: string; startDate?: string; endDate?: string; travellers?: number }) => {
      const existing = trips.find((t) => t.status === "draft");
      if (existing) {
        const patch = Object.fromEntries(Object.entries(seed ?? {}).filter(([, v]) => v !== undefined));
        const merged = { ...existing, ...patch } as Trip;
        setTrips((prev) => {
          const next = prev.map((t) => (t.id === existing.id ? merged : t));
          save("yatraa_trips", next);
          return next;
        });
        setCurrentTrip(merged);
        return merged;
      }
      const now = new Date().toISOString();
      const trip: Trip = {
        id: `TRP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: seed?.name ?? "My Journey",
        status: "draft",
        origin: seed?.origin,
        destinations: seed?.destination ? [seed.destination] : [],
        startDate: seed?.startDate ?? "",
        endDate: seed?.endDate ?? "",
        travellers: seed?.travellers ?? 2,
        items: [],
        totalAmount: 0,
        createdAt: now,
        updatedAt: now,
      };
      setTrips((prev) => {
        const next = [trip, ...prev];
        save("yatraa_trips", next);
        return next;
      });
      setCurrentTrip(trip);
      return trip;
    },
    [trips]
  );

  const createTrip = useCallback(
    (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) => {
      const id = `TRP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const newTrip: Trip = { ...trip, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setTrips((prev) => {
        const next = [newTrip, ...prev];
        save("yatraa_trips", next);
        return next;
      });
      return id;
    },
    []
  );

  const updateTrip = useCallback(
    (id: string, updates: Partial<Trip>) => {
      setTrips((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
        save("yatraa_trips", next);
        return next;
      });
      // Update currentTrip if it's the one being updated
      setCurrentTrip((prev) => (prev && prev.id === id ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev));
    },
    []
  );

  const deleteTrip = useCallback(
    (id: string) => {
      setTrips((prev) => {
        const next = prev.filter((t) => t.id !== id);
        save("yatraa_trips", next);
        return next;
      });
      setCurrentTrip((prev) => (prev && prev.id === id ? null : prev));
    },
    []
  );

  const addItemToTrip = useCallback(
    (tripId: string, item: Omit<TripItem, "id">) => {
      setTrips((prev) => {
        const next = prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                items: [...t.items, { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }],
                totalAmount: t.items.reduce((sum, i) => sum + i.amount, 0) + item.amount,
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        save("yatraa_trips", next);
        return next;
      });
      // Update currentTrip if it's the one being updated
      setCurrentTrip((prev) =>
        prev && prev.id === tripId
          ? {
              ...prev,
              items: [...prev.items, { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }],
              totalAmount: prev.items.reduce((sum, i) => sum + i.amount, 0) + item.amount,
              updatedAt: new Date().toISOString(),
            }
          : prev
      );
    },
    []
  );

  const removeItemFromTrip = useCallback(
    (tripId: string, itemId: string) => {
      setTrips((prev) => {
        const next = prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                items: t.items.filter((i) => i.id !== itemId),
                totalAmount: t.items.filter((i) => i.id !== itemId).reduce((sum, i) => sum + i.amount, 0),
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        save("yatraa_trips", next);
        return next;
      });
      // Update currentTrip if it's the one being updated
      setCurrentTrip((prev) =>
        prev && prev.id === tripId
          ? {
              ...prev,
              items: prev.items.filter((i) => i.id !== itemId),
              totalAmount: prev.items.filter((i) => i.id !== itemId).reduce((sum, i) => sum + i.amount, 0),
              updatedAt: new Date().toISOString(),
            }
          : prev
      );
    },
    []
  );

  const updateTripItem = useCallback(
    (tripId: string, itemId: string, updates: Partial<TripItem>) => {
      setTrips((prev) => {
        const next = prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                items: t.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
                totalAmount: t.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)).reduce((sum, i) => sum + i.amount, 0),
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        save("yatraa_trips", next);
        return next;
      });
      // Update currentTrip if it's the one being updated
      setCurrentTrip((prev) =>
        prev && prev.id === tripId
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
              totalAmount: prev.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)).reduce((sum, i) => sum + i.amount, 0),
              updatedAt: new Date().toISOString(),
            }
          : prev
      );
    },
    []
  );

  /** Search state functions */
  const updateSearchState = useCallback((state: Partial<SearchState>) => {
    setSearchState((prev) => {
      const next = { ...prev, ...state };
      save("yatraa_search_state", next);
      return next;
    });
  }, []);

  const clearSearchState = useCallback(
    (type?: keyof SearchState) => {
      if (type) {
        setSearchState((prev) => {
          const next = { ...prev };
          delete next[type];
          save("yatraa_search_state", next);
          return next;
        });
      } else {
        setSearchState({});
        save("yatraa_search_state", {});
      }
    },
    []
  );

  const value = useMemo<AppState>(
    () => ({
      user,
      login,
      logout,
      bookings,
      addBooking,
      cancelBooking,
      wishlist,
      toggleWishlist,
      notifications,
      markAllRead,
      toasts,
      toast,
      dismissToast,
      travellers,
      saveTraveller,
      removeTraveller,
      pendingPlan,
      setPendingPlan,
      /** Trip state */
      trips,
      currentTrip,
      createTrip,
      updateTrip,
      deleteTrip,
      setCurrentTrip,
      ensureDraftTrip,
      addItemToTrip,
      removeItemFromTrip,
      updateTripItem,
      /** Search state */
      searchState,
      setSearchState,
      updateSearchState,
      clearSearchState,
      hydrated,
    }),
    [
      user,
      login,
      logout,
      bookings,
      addBooking,
      cancelBooking,
      wishlist,
      toggleWishlist,
      notifications,
      markAllRead,
      toasts,
      toast,
      dismissToast,
      travellers,
      saveTraveller,
      removeTraveller,
      pendingPlan,
      hydrated,
      trips,
      currentTrip,
      createTrip,
      updateTrip,
      deleteTrip,
      setCurrentTrip,
      ensureDraftTrip,
      addItemToTrip,
      removeItemFromTrip,
      updateTripItem,
      searchState,
      setSearchState,
      updateSearchState,
      clearSearchState,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** Helper: stash a booking and navigate to checkout */
export function goToCheckout(router: { push: (p: string) => void }, pending: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("yatraa_pending", JSON.stringify(pending));
  }
  router.push("/checkout");
}
