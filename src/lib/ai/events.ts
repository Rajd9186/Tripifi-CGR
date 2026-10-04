import type { AIEventName } from "./types";

/** Safe high-level progress labels. Never exposes chain-of-thought. */
const LABELS: Partial<Record<AIEventName, string>> = {
  AI_STARTED: "Tripifi AI thinking…",
  CONTEXT_LOADED: "Understanding your trip…",
  INTENT_DETECTED: "Understanding your trip…",
  SEARCHING_DESTINATIONS: "Finding suitable options…",
  SEARCHING_TRANSPORT: "Checking transport…",
  SEARCHING_HOTELS: "Checking stays…",
  BUILDING_ITINERARY: "Building itinerary…",
  CALCULATING_BUDGET: "Checking budget…",
  VALIDATING: "Checking trip…",
  TOOL_STARTED: "Working on it…",
  AI_MESSAGE: "Writing response…",
};

export function progressLabel(event: AIEventName | string): string | null {
  return LABELS[event as AIEventName] ?? null;
}
