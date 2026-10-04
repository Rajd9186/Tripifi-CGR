/** Versioned browser persistence. Schema migrations keep old installs working. */

const STATE_KEY = "tripifi_state_v1";

export const STATE_VERSION = 1;

export interface PersistedState {
  version: number;
  trips?: unknown;
  wishlist?: unknown;
  travellers?: unknown;
  bookings?: unknown;
  searchState?: unknown;
  updatedAt: string;
}

const LEGACY_KEYS = ["yatraa_trips", "yatraa_wishlist", "yatraa_travellers", "yatraa_bookings", "yatraa_search_state", "yatraa_user"] as const;

function readRaw(key: string): unknown {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : undefined;
  } catch {
    return undefined;
  }
}

function writeRaw(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — product must keep working.
  }
}

export function loadPersistedState(): PersistedState | null {
  const current = readRaw(STATE_KEY) as PersistedState | undefined;
  if (current && typeof current === "object" && current.version === STATE_VERSION) {
    return current;
  }
  // Migrate legacy yatraa_* keys once.
  const legacy: PersistedState = {
    version: STATE_VERSION,
    trips: readRaw("yatraa_trips"),
    wishlist: readRaw("yatraa_wishlist"),
    travellers: readRaw("yatraa_travellers"),
    bookings: readRaw("yatraa_bookings"),
    searchState: readRaw("yatraa_search_state"),
    updatedAt: new Date().toISOString(),
  };
  const hasAny = LEGACY_KEYS.some((k) => readRaw(k) !== undefined);
  if (!hasAny) return null;
  writeRaw(STATE_KEY, legacy);
  return legacy;
}

export function savePersistedState(partial: Omit<PersistedState, "version" | "updatedAt">): void {
  const prev = (readRaw(STATE_KEY) as PersistedState | undefined) ?? { version: STATE_VERSION, updatedAt: "" };
  writeRaw(STATE_KEY, { ...prev, ...partial, version: STATE_VERSION, updatedAt: new Date().toISOString() });
}

export function loadLegacy<T>(key: string, fallback: T): T {
  const v = readRaw(key) as T | undefined;
  return v === undefined ? fallback : v;
}

export function saveLegacy(key: string, value: unknown): void {
  writeRaw(key, value);
}
