import type { DestinationMedia, MediaProvider, MediaQueryOptions } from "./types";
import { findDestination } from "@/lib/destinations";
import { resolveDestinationSlug } from "./media-utils";

/** Generic premium fallback — last resort, still destination-aware. */
export class FallbackMediaProvider implements MediaProvider {
  readonly name = "fallback";

  async getDestinationMedia(destination: string, _options?: MediaQueryOptions): Promise<DestinationMedia | null> {
    const dest = findDestination(resolveDestinationSlug(destination));
    const src = dest?.heroImage ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80";
    const name = dest?.name ?? destination;
    return {
      destination: destination.toLowerCase(),
      hero: { id: `fallback-${destination}-hero`, type: "image", src, alt: `${name} — Tripifi CGR`, source: "fallback" },
      gallery: (dest?.gallery ?? [src]).slice(0, 4).map((s, i) => ({
        id: `fallback-${destination}-gallery-${i}`,
        type: "image",
        src: s,
        alt: `${name} — Tripifi CGR`,
        source: "fallback" as const,
      })),
      effects: [],
      resolvedFrom: "fallback",
    };
  }
}
