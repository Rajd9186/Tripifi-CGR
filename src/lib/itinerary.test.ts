import { describe, expect, it } from "vitest";
import { buildItinerary, detectConflicts, moveItemAcrossDays } from "./itinerary";
import type { TripItem } from "./store";

const item = (over: Partial<TripItem>): TripItem => ({
  id: Math.random().toString(36).slice(2),
  type: "custom",
  title: "Activity",
  date: "",
  amount: 1000,
  status: "upcoming",
  details: {},
  ...over,
});

describe("itinerary engine", () => {
  it("builds one day per date range", () => {
    const days = buildItinerary([], "2026-11-10", "2026-11-12");
    expect(days).toHaveLength(3);
    expect(days[0]?.date).toBe("2026-11-10");
    expect(days[2]?.date).toBe("2026-11-12");
  });

  it("flags overloaded days", () => {
    const items = Array.from({ length: 5 }, () => item({}));
    const days = buildItinerary(items, "2026-11-10", "2026-11-10");
    const conflicts = detectConflicts(days);
    expect(conflicts.some((c) => c.id.startsWith("overload"))).toBe(true);
  });

  it("moves items across days", () => {
    const a = item({ details: { Day: "Day 1" } });
    const days = buildItinerary([a], "2026-11-10", "2026-11-11");
    const { moved, days: next } = moveItemAcrossDays(days, a.id, 2);
    expect(moved).toBe(true);
    expect(next[1]?.items.map((i) => i.id)).toContain(a.id);
  });

  it("rejects invalid day moves", () => {
    const a = item({});
    const days = buildItinerary([a], "2026-11-10", "2026-11-10");
    expect(moveItemAcrossDays(days, a.id, 5).moved).toBe(false);
    expect(moveItemAcrossDays(days, "missing", 1).moved).toBe(false);
  });
});
