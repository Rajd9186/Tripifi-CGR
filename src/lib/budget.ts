/** Trip budget engine. Deterministic — no hardcoded totals in UI. */

import type { TripItem } from "./store";

export interface BudgetBreakdown {
  flights: number;
  trains: number;
  hotels: number;
  cabs: number;
  activities: number;
  food: number;
  taxes: number;
  addons: number;
  subtotal: number;
  total: number;
  perTraveller: number;
  count: number;
}

const TAX_RATE = 0.05;

function categoryOf(item: TripItem): keyof Omit<BudgetBreakdown, "subtotal" | "total" | "perTraveller" | "count"> {
  switch (item.type) {
    case "flight":
      return "flights";
    case "train":
      return "trains";
    case "hotel":
      return "hotels";
    case "cab":
      return "cabs";
    default:
      return "activities";
  }
}

export function calculateBudget(items: TripItem[], travellers: number, addons = 0): BudgetBreakdown {
  const base = { flights: 0, trains: 0, hotels: 0, cabs: 0, activities: 0, food: 0, taxes: 0, addons };
  for (const item of items) {
    const key = categoryOf(item);
    if (key === "food") base.food += item.amount;
    else if (key === "taxes") base.taxes += item.amount;
    else base[key] += item.amount;
  }
  const subtotal = base.flights + base.trains + base.hotels + base.cabs + base.activities + base.food;
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + taxes + addons;
  const safeTravellers = Math.max(1, Math.floor(travellers) || 1);
  return {
    ...base,
    taxes,
    subtotal,
    total,
    perTraveller: Math.ceil(total / safeTravellers),
    count: items.length,
  };
}

export interface BudgetSuggestion {
  id: string;
  title: string;
  detail: string;
  estimatedSavings: number;
}

export function suggestOptimizations(
  breakdown: BudgetBreakdown,
  budget: number,
  items: TripItem[]
): BudgetSuggestion[] {
  if (breakdown.total <= budget || items.length === 0) return [];
  const over = breakdown.total - budget;
  const suggestions: BudgetSuggestion[] = [];

  const hotels = items.filter((i) => i.type === "hotel").sort((a, b) => b.amount - a.amount);
  if (hotels[0]) {
    suggestions.push({
      id: "hotel-downgrade",
      title: "Switch to a comfortable hotel tier",
      detail: `${hotels[0].title} — estimated saving up to 25% of hotel spend.`,
      estimatedSavings: Math.round(hotels[0].amount * 0.25),
    });
  }
  const cabs = items.filter((i) => i.type === "cab").sort((a, b) => b.amount - a.amount);
  if (cabs[0] && cabs[0].amount > 4000) {
    suggestions.push({
      id: "cab-category",
      title: "Choose a lower cab category for transfers",
      detail: `${cabs[0].title} — Sedan instead of SUV where roads allow.`,
      estimatedSavings: Math.min(1500, Math.round(cabs[0].amount * 0.2)),
    });
  }
  const activities = items.filter((i) => i.type === "custom" || i.type === "package").sort((a, b) => b.amount - a.amount);
  if (activities[0]) {
    suggestions.push({
      id: "activity-trim",
      title: "Make one activity optional",
      detail: `${activities[0].title} — keep it flexible instead of pre-booked.`,
      estimatedSavings: activities[0].amount,
    });
  }
  void over;
  return suggestions.slice(0, 3);
}
