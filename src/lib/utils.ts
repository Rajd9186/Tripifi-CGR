import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* ------------------------------------------------------------------ */
/* Class helpers                                                       */
/* ------------------------------------------------------------------ */

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Currency / numbers                                                  */
/* ------------------------------------------------------------------ */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(n: number): string {
  return inr.format(Math.round(n));
}

export function formatNum(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

export function formatCurrency(amount: number, currency = "INR", locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nightsBetween(a: string, b: string): number {
  const d1 = new Date(a + "T00:00:00").getTime();
  const d2 = new Date(b + "T00:00:00").getTime();
  return Math.max(0, Math.round((d2 - d1) / 86400000));
}

export function prettyDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function shortDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function durStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/* ------------------------------------------------------------------ */
/* IDs / strings                                                       */
/* ------------------------------------------------------------------ */

export function bookingId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `YT-${new Date().getFullYear()}-${n}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "...";
}

export function generateId(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/* ------------------------------------------------------------------ */
/* Deterministic randomness                                            */
/* ------------------------------------------------------------------ */

/** Deterministic hash → seeded PRNG (so mock results are stable per query) */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return Math.abs(h % 100000) / 100000;
  };
}

/* ------------------------------------------------------------------ */
/* Time-of-day helpers                                                 */
/* ------------------------------------------------------------------ */

export function minToTime(baseISO: string, minutes: number): string {
  const d = new Date(baseISO + "T00:00:00");
  d.setMinutes(d.getMinutes() + minutes);
  return d.toTimeString().slice(0, 5);
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

/* ------------------------------------------------------------------ */
/* Functional helpers                                                  */
/* ------------------------------------------------------------------ */

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
