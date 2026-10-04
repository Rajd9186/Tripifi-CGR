import type { DestinationMedia } from "./types";

interface Entry {
  media: DestinationMedia;
  expires: number;
}

const store = new Map<string, Entry>();

/** 24h default TTL. Selected metadata is cached so heroes stay stable. */
export function mediaCacheGet(key: string): DestinationMedia | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) {
    store.delete(key);
    return null;
  }
  return hit.media;
}

export function mediaCacheSet(key: string, media: DestinationMedia, ttlMs = 24 * 60 * 60 * 1000): void {
  store.set(key, { media, expires: Date.now() + ttlMs });
}

export function mediaCacheKey(destination: string, placement: string, query: string): string {
  return `${destination.toLowerCase()}|${placement}|${query.toLowerCase().trim()}`;
}
