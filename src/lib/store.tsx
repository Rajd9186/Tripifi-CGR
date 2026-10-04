"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
}

const Ctx = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
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

  useEffect(() => {
    const savedUser = load<AppState["user"] | null>("yatraa_user", null);
    if (savedUser) setUser(savedUser);
    const b = load<Booking[] | null>("yatraa_bookings", null);
    if (b) setBookings([...b, ...SEED_BOOKINGS]);
    const w = load<string[] | null>("yatraa_wishlist", null);
    if (w) setWishlist(w);
    const t = load<SavedTraveller[] | null>("yatraa_travellers", null);
    if (t) setTravellers(t);
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
      hydrated,
    }),
    [user, login, logout, bookings, addBooking, cancelBooking, wishlist, toggleWishlist, notifications, markAllRead, toasts, toast, dismissToast, travellers, saveTraveller, removeTraveller, pendingPlan, hydrated]
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
