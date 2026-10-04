import { NextRequest, NextResponse } from "next/server";
import { mediaCacheGet, mediaCacheSet, mediaCacheKey } from "@/lib/media/media-cache";
import { mediaConfigFor } from "@/data/media";
import { findDestination } from "@/lib/destinations";
import { resolveDestinationSlug } from "@/lib/media/media-utils";
import { LocalMediaProvider } from "@/lib/media/local-media-provider";
import { FallbackMediaProvider } from "@/lib/media/fallback-media-provider";
import { UnsplashError, triggerDownloadEvent, unsplashHeroFor } from "@/lib/media/unsplash-media-provider";
import type { DestinationMedia } from "@/lib/media/types";

const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const rawDestination = (req.nextUrl.searchParams.get("destination") ?? "").toLowerCase();
  const destination = resolveDestinationSlug(rawDestination);
  const placement = req.nextUrl.searchParams.get("placement") ?? "hero";
  if (!destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 400 });
  }

  const config = mediaConfigFor(destination);
  const cacheKey = mediaCacheKey(destination, placement, config?.queries[0] ?? destination);
  const cached = mediaCacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const dest = findDestination(destination);
  const altFallback = dest ? `${dest.name} — Tripifi CGR` : `${destination} — Tripifi CGR`;

  // 1. Local / licensed media (preferred long-term source).
  try {
    const local = await new LocalMediaProvider().getDestinationMedia(destination);
    // Only short-circuit on a real local file hero (not the curated fallback).
    if (local?.resolvedFrom === "local") {
      mediaCacheSet(cacheKey, local, CACHE_TTL);
      return NextResponse.json(local);
    }
  } catch {
    // fall through to enhancement layer
  }

  // 2. Curated Unsplash media (enhancement layer, server-side key, cached).
  if (process.env.UNSPLASH_ACCESS_KEY && config) {
    try {
      const picked = await unsplashHeroFor(destination, config.queries, altFallback, req.signal);
      if (picked) {
        const media: DestinationMedia = {
          destination,
          hero: picked.hero,
          gallery: picked.gallery,
          effects: config.effects,
          resolvedFrom: "unsplash",
        };
        mediaCacheSet(cacheKey, media, CACHE_TTL);
        return NextResponse.json(media);
      }
    } catch (e) {
      // 401/403/429/timeout/empty → fall through to fallback. Log server-side only.
      if (e instanceof UnsplashError) console.warn(`[media] unsplash ${e.status} for ${destination}`);
      else console.warn(`[media] unsplash failed for ${destination}`);
    }
  }

  // 3–4. Destination fallback → generic premium fallback. Site always works.
  const fallback = await new FallbackMediaProvider().getDestinationMedia(destination);
  const media: DestinationMedia = {
    ...(fallback as DestinationMedia),
    effects: config?.effects ?? [],
  };
  mediaCacheSet(cacheKey, media, CACHE_TTL);
  return NextResponse.json(media);
}

export async function POST(req: NextRequest) {
  // Download-event endpoint: called only for genuine insert-like user actions
  // (e.g. "Use as trip cover"). Never for ordinary image viewing.
  let body: { downloadLocation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.downloadLocation?.startsWith("https://api.unsplash.com/")) {
    return NextResponse.json({ error: "invalid download location" }, { status: 400 });
  }
  try {
    await triggerDownloadEvent(body.downloadLocation);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
