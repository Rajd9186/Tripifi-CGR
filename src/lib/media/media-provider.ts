"use client";

import { useEffect, useState } from "react";
import { mediaCacheGet, mediaCacheSet } from "./media-cache";
import type { DestinationMedia, MediaQueryOptions } from "./types";

/**
 * Browser entry point. UI components must use this (or the server route it
 * calls) — never Unsplash directly. Client-side memory cache keeps heroes
 * stable across navigations without new searches.
 */
export async function getDestinationMedia(
  destination: string,
  options: MediaQueryOptions = {}
): Promise<DestinationMedia | null> {
  const placement = options.placement ?? "hero";
  const key = `${destination.toLowerCase()}|${placement}`;
  const cached = mediaCacheGet(key);
  if (cached) return cached;

  const params = new URLSearchParams({ destination, placement });
  if (options.orientation) params.set("orientation", options.orientation);
  const res = await fetch(`/api/media?${params.toString()}`);
  if (!res.ok) return null;
  const media = (await res.json()) as DestinationMedia;
  mediaCacheSet(key, media);
  return media;
}

export function useDestinationMedia(destination: string, options: MediaQueryOptions = {}) {
  const placement = options.placement ?? "hero";
  const [media, setMedia] = useState<DestinationMedia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDestinationMedia(destination, { placement })
      .then((m) => {
        if (!cancelled) {
          setMedia(m);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [destination, placement]);

  return { media, loading };
}
