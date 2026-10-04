import { relevanceScore, tokensOf } from "./media-utils";
import type { MediaAsset } from "./types";

interface Rankable extends MediaAsset {
  likes?: number;
  queryTokens?: string[];
}

/**
 * Lightweight ranking: destination relevance first, then composition fitness.
 * Never invents metadata — only scores what the API returned.
 */
export function rankMedia(
  candidates: Rankable[],
  destination: string,
  opts: { orientation?: "landscape" | "portrait"; minWidth?: number; hero?: boolean } = {}
): Rankable[] {
  const destTokens = tokensOf(destination.replace(/-/g, " "));
  const orientation = opts.orientation ?? "landscape";
  const minWidth = opts.minWidth ?? (opts.hero ? 1600 : 800);

  return [...candidates]
    .map((c) => {
      let score = 0;
      // Destination relevance (strongest signal)
      score += relevanceScore(`${c.alt}`, destTokens) * 4;
      // Orientation fitness
      const w = c.width ?? 0;
      const h = c.height ?? 0;
      if (w && h) {
        const landscape = w >= h;
        if ((orientation === "landscape") === landscape) score += 6;
        const ratio = landscape ? w / h : h / w;
        if (ratio >= 1.4 && ratio <= 2.4) score += 4; // cinematic crop room
        if (w >= minWidth) score += 5;
        else if (w >= minWidth / 2) score += 2;
      }
      // Community quality signal (only if the API provided it)
      if (typeof c.likes === "number" && c.likes > 0) score += Math.min(4, Math.log10(c.likes + 1) * 2);
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((r) => r.c);
}
