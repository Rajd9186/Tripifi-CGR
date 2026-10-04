/**
 * SERVER-ONLY Unsplash provider. Never import from client components —
 * the access key must remain confidential (use the /api/media proxy).
 */

import { rankMedia } from "./media-ranking";
import { withUtm } from "./media-utils";
import type { DestinationMedia, MediaAsset, MediaQueryOptions } from "./types";

interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  description: string | null;
  width: number;
  height: number;
  likes: number;
  color: string;
  urls: { raw: string; full: string; regular: string; small: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

export class UnsplashError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function key(): string {
  const k = process.env.UNSPLASH_ACCESS_KEY;
  if (!k) throw new UnsplashError(401, "UNSPLASH_ACCESS_KEY is not configured");
  return k;
}

export async function searchUnsplashPhotos(query: string, perPage = 10, signal?: AbortSignal): Promise<UnsplashPhoto[]> {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?${new URLSearchParams({
      query,
      per_page: String(Math.min(Math.max(perPage, 1), 20)),
      orientation: "landscape",
      content_filter: "high",
    })}`,
    {
      headers: { Authorization: `Client-ID ${key()}` },
      signal,
      cache: "no-store",
    }
  );
  if (res.status === 401 || res.status === 403) throw new UnsplashError(res.status, "Unsplash credentials rejected");
  if (res.status === 429) throw new UnsplashError(429, "Unsplash rate limit reached");
  if (!res.ok) throw new UnsplashError(res.status, `Unsplash error ${res.status}`);
  const data = (await res.json()) as { results: UnsplashPhoto[] };
  return data.results ?? [];
}

function mapPhoto(photo: UnsplashPhoto, destination: string, altFallback: string): MediaAsset {
  return {
    id: `unsplash-${photo.id}`,
    type: "image",
    // Hotlink the API-returned URL as Unsplash requires — never rehost.
    src: photo.urls.regular,
    alt: photo.alt_description || photo.description || altFallback,
    source: "unsplash",
    photographer: { name: photo.user.name, profileUrl: withUtm(photo.user.links.html) },
    sourceUrl: withUtm(photo.links.html),
    downloadLocation: photo.links.download_location,
    attributionRequired: true,
    width: photo.width,
    height: photo.height,
    dominantColor: photo.color,
  };
}

export async function unsplashHeroFor(
  destination: string,
  queries: string[],
  altFallback: string,
  signal?: AbortSignal
): Promise<{ hero: MediaAsset; gallery: MediaAsset[] } | null> {
  for (const query of queries) {
    try {
      const photos = await searchUnsplashPhotos(query, 10, signal);
      if (photos.length === 0) continue;
      const ranked = rankMedia(
        photos.map((p) => ({
          ...mapPhoto(p, destination, altFallback),
          likes: p.likes,
        })),
        destination,
        { orientation: "landscape", minWidth: 1600, hero: true }
      );
      const hero = ranked[0];
      if (!hero) continue;
      return { hero, gallery: ranked.slice(1, 7) };
    } catch (e) {
      if (e instanceof UnsplashError && (e.status === 401 || e.status === 403 || e.status === 429)) throw e;
      continue; // per-query failure → try next destination-specific query
    }
  }
  return null;
}

export async function triggerDownloadEvent(downloadLocation: string): Promise<void> {
  // Required when a user action equals selecting/inserting the image.
  await fetch(downloadLocation, { headers: { Authorization: `Client-ID ${key()}` }, cache: "no-store" }).catch(() => {});
}

export type { MediaQueryOptions };
export type { DestinationMedia };
