import { describe, expect, it } from "vitest";
import { calculateCabFare, estimateTolls } from "./providers/cabPricing";
import { calculateBudget, suggestOptimizations } from "./budget";
import type { TripItem } from "./store";

const item = (over: Partial<TripItem> & { amount: number }): TripItem => ({
  id: Math.random().toString(36).slice(2),
  type: "flight",
  title: "Test",
  date: "",
  status: "upcoming",
  details: {},
  ...over,
});

describe("cab pricing engine", () => {
  it("charges base fare within included km", () => {
    const fare = calculateCabFare(50, "sedan", "oneway", 0);
    expect(fare.includedKm).toBe(100);
    expect(fare.extraKm).toBe(0);
    expect(fare.total).toBe(fare.baseFare + fare.taxes);
  });

  it("doubles distance for round trips", () => {
    const one = calculateCabFare(100, "suv", "oneway", 0);
    const round = calculateCabFare(100, "suv", "roundtrip", 0);
    expect(round.total).toBeGreaterThan(one.total);
  });

  it("is deterministic", () => {
    expect(calculateCabFare(154, "sedan", "oneway", 350)).toEqual(calculateCabFare(154, "sedan", "oneway", 350));
  });

  it("estimates tolls by distance band", () => {
    expect(estimateTolls(10)).toBe(0);
    expect(estimateTolls(154)).toBe(150);
    expect(estimateTolls(400)).toBe(350);
  });
});

describe("trip budget engine", () => {
  it("totals categories with 5% tax and per-traveller split", () => {
    const items = [
      item({ type: "flight", amount: 10000 }),
      item({ type: "hotel", amount: 20000 }),
      item({ type: "cab", amount: 5000 }),
    ];
    const b = calculateBudget(items, 2);
    expect(b.subtotal).toBe(35000);
    expect(b.taxes).toBe(1750);
    expect(b.total).toBe(36750);
    expect(b.perTraveller).toBe(Math.ceil(36750 / 2));
    expect(b.count).toBe(3);
  });

  it("handles empty trips", () => {
    const b = calculateBudget([], 2);
    expect(b.total).toBe(0);
    expect(b.perTraveller).toBe(0);
  });

  it("suggests optimizations only when over budget", () => {
    const items = [item({ type: "hotel", amount: 40000, title: "Grand Hotel" })];
    const over = calculateBudget(items, 2);
    expect(suggestOptimizations(over, 10000, items).length).toBeGreaterThan(0);
    const under = calculateBudget(items, 2);
    expect(suggestOptimizations(under, 100000, items)).toEqual([]);
  });
});
