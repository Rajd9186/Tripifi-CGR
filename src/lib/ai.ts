/** Deterministic demo trip parsing. Structured so a future LLM replaces parseTripBrief only. */

import { DESTINATIONS } from "./destinations";
import { AIRPORTS } from "@/data/airports";

export interface TripBrief {
  origin?: string;
  destination?: string;
  destinationSlug?: string;
  days?: number;
  travellers?: number;
  budget?: number;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  couple: 2,
};

function findDestinationMention(text: string): { slug: string; name: string } | null {
  const lower = text.toLowerCase();
  // Longest name first so "darjeeling" doesn't lose to shorter matches.
  const sorted = [...DESTINATIONS].sort((a, b) => b.name.length - a.name.length);
  for (const d of sorted) {
    if (lower.includes(d.name.toLowerCase()) || lower.includes(d.slug.replace(/-/g, " "))) {
      return { slug: d.slug, name: d.name };
    }
  }
  return null;
}

function findOriginMention(text: string): string | null {
  const lower = text.toLowerCase();
  for (const a of AIRPORTS) {
    if (lower.includes(a.city.toLowerCase()) || lower.includes(a.code.toLowerCase())) {
      return a.city;
    }
  }
  const m = /from\s+([A-Za-z\s]+?)(?:\s+to\s|\s+for\s|\s+under\s|\s*,|\s*$)/i.exec(text);
  return m ? m[1].trim() : null;
}

export function parseTripBrief(text: string): TripBrief {
  const lower = text.toLowerCase();
  const brief: TripBrief = {};

  const dest = findDestinationMention(text);
  if (dest) {
    brief.destination = dest.name;
    brief.destinationSlug = dest.slug;
  }
  const origin = findOriginMention(text);
  if (origin) brief.origin = origin;

  const daysMatch = /(\d+)\s*-?\s*days?/i.exec(text) ?? /(\d+)\s*-?\s*nights?/i.exec(text);
  if (daysMatch) brief.days = Math.min(30, Math.max(1, parseInt(daysMatch[1], 10)));
  else {
    for (const [word, n] of Object.entries(NUMBER_WORDS)) {
      if (new RegExp(`\\b${word}\\b\\s*-?\\s*days?`, "i").test(text)) {
        brief.days = n;
        break;
      }
    }
    if (!brief.days && /\bweekend\b/i.test(text)) brief.days = 3;
  }

  const travMatch = /(\d+)\s*(?:people|persons|travellers|travelers|adults)/i.exec(text);
  if (travMatch) brief.travellers = Math.min(20, Math.max(1, parseInt(travMatch[1], 10)));
  else if (/partner|couple|honeymoon|wife|husband/i.test(text)) brief.travellers = 2;
  else if (/family/i.test(text)) brief.travellers = 4;
  else if (/solo|alone|myself/i.test(text)) brief.travellers = 1;

  const budgetMatch = /(?:under|around|budget)[^\d₹]*₹?\s*([\d,]+)/i.exec(text) ?? /₹\s*([\d,]+)/.exec(text);
  if (budgetMatch) {
    const raw = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
    if (Number.isFinite(raw)) {
      brief.budget = raw < 1000 ? raw * 1000 : raw; // "50" likely means 50,000 in context
    }
  }
  void lower;

  return brief;
}

export function briefSummary(brief: TripBrief): string {
  const parts: string[] = [];
  if (brief.destination) parts.push(brief.destination);
  if (brief.days) parts.push(`${brief.days} days`);
  if (brief.travellers) parts.push(`${brief.travellers} traveller${brief.travellers === 1 ? "" : "s"}`);
  if (brief.budget) parts.push(`under ₹${brief.budget.toLocaleString("en-IN")}`);
  return parts.join(" · ");
}
