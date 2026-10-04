import type { DestinationMedia, MediaAsset, MediaProvider, MediaQueryOptions } from "./types";
import { mediaConfigFor } from "@/data/media";
import { findDestination } from "@/lib/destinations";
import { resolveDestinationSlug } from "./media-utils";

/**
 * Local + curated fallback provider. No network, no keys.
 * Existing destination heroImage/gallery act as the curated layer until
 * licensed local files ship under /public/media.
 */
export class LocalMediaProvider implements MediaProvider {
  readonly name = "local";

  async getDestinationMedia(destination: string, _options?: MediaQueryOptions): Promise<DestinationMedia | null> {
    const slug = destination.toLowerCase();
    const resolved = resolveDestinationSlug(slug);
    const dest = findDestination(resolved);
    if (!dest) return null;
    const config = mediaConfigFor(slug);

    const hero: MediaAsset | undefined = config?.localHero
      ? {
          id: `local-${slug}-hero`,
          type: "image",
          src: config.localHero,
          alt: `${dest.name} — Tripifi CGR`,
          source: "local",
        }
      : undefined;

    const mobileHero: MediaAsset | undefined = config?.localMobileHero
      ? {
          id: `local-${slug}-hero-mobile`,
          type: "image",
          src: config.localMobileHero,
          alt: `${dest.name} — Tripifi CGR`,
          source: "local",
        }
      : undefined;

    // Curated fallback: existing destination imagery (already destination-specific).
    const curatedHero: MediaAsset = {
      id: `curated-${slug}-hero`,
      type: "image",
      src: dest.heroImage,
      alt: `${dest.name} — Tripifi CGR`,
      source: "fallback",
    };
    const gallery: MediaAsset[] = (dest.gallery ?? []).slice(0, 6).map((src, i) => ({
      id: `curated-${slug}-gallery-${i}`,
      type: "image",
      src,
      alt: `${dest.name} — Tripifi CGR`,
      source: "fallback",
    }));

    return {
      destination: slug,
      hero: hero ?? curatedHero,
      mobileHero,
      gallery,
      effects: config?.effects ?? [],
      resolvedFrom: hero ? "local" : "fallback",
    };
  }
}
