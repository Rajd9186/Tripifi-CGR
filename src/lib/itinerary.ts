/** Day-by-day itinerary engine + deterministic conflict detection. */

import type { TripItem } from "./store";

export interface TripDay {
  day: number;
  date: string;
  items: TripItem[];
}

export function nightsBetween(startISO: string, endISO: string): number {
  const a = new Date(startISO + "T00:00:00").getTime();
  const b = new Date(endISO + "T00:00:00").getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayIndexOf(item: TripItem, totalDays: number): number {
  const m = /day\s*(\d+)/i.exec(item.details.Day ?? "");
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= totalDays) return n - 1;
  }
  // Distribute deterministically by hash of id so re-renders are stable.
  let h = 0;
  for (let i = 0; i < item.id.length; i++) h = (h * 31 + item.id.charCodeAt(i)) >>> 0;
  return totalDays === 0 ? 0 : h % totalDays;
}

export function buildItinerary(items: TripItem[], startDate: string, endDate: string): TripDay[] {
  const nights = nightsBetween(startDate, endDate);
  const totalDays = Math.max(1, nights + (nights > 0 ? 1 : 1));
  const days: TripDay[] = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    date: startDate ? addDaysISO(startDate, i) : "",
    items: [],
  }));
  for (const item of items) {
    days[dayIndexOf(item, totalDays)]?.items.push(item);
  }
  return days;
}

export interface ItineraryConflict {
  id: string;
  severity: "warning" | "info";
  message: string;
}

const TRANSFER_MINUTES: Record<string, number> = {
  "gangtok-pelling": 240,
  "gangtoktsomgo": 180,
  "srinagar-pahalgam": 180,
  "kolkata-bagdogra": 120,
};

export function transferMinutes(from: string, to: string): number | null {
  const key = `${from.toLowerCase().replace(/[^a-z]/g, "")}${to.toLowerCase().replace(/[^a-z]/g, "")}`;
  for (const [route, mins] of Object.entries(TRANSFER_MINUTES)) {
    if (key.includes(route.replace("-", ""))) return mins;
  }
  return null;
}

export function detectConflicts(days: TripDay[]): ItineraryConflict[] {
  const conflicts: ItineraryConflict[] = [];
  for (const day of days) {
    const activities = day.items.filter((i) => i.type === "custom" || i.type === "package");
    if (activities.length > 4) {
      conflicts.push({
        id: `overload-day-${day.day}`,
        severity: "warning",
        message: `Day ${day.day} has ${activities.length} activities planned. Consider moving some to another day.`,
      });
    }
    const transports = day.items.filter((i) => i.type === "flight" || i.type === "train" || i.type === "cab");
    if (transports.length > 2 && activities.length > 2) {
      conflicts.push({
        id: `tight-day-${day.day}`,
        severity: "info",
        message: `Day ${day.day} combines ${transports.length} transfers with ${activities.length} activities — this may be too tight.`,
      });
    }
  }
  return conflicts;
}

export function moveItemAcrossDays(
  days: TripDay[],
  itemId: string,
  toDay: number
): { days: TripDay[]; moved: boolean } {
  let found: import("./store").TripItem | null = null;
  const stripped = days.map((d) => {
    const remaining = d.items.filter((i) => {
      if (i.id === itemId) {
        found = i;
        return false;
      }
      return true;
    });
    return { ...d, items: remaining };
  });
  if (!found || toDay < 1 || toDay > stripped.length) return { days, moved: false };
  const item = found as import("./store").TripItem;
  const next = stripped.map((d) =>
    d.day === toDay ? { ...d, items: [...d.items, { ...item, details: { ...item.details, Day: `Day ${toDay}` } }] } : d
  );
  return { days: next, moved: true };
}
