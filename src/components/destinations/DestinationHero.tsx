"use client";

import { useState } from "react";
import Image from "next/image";
import { useDestinationMedia } from "@/lib/media/media-provider";
import CinematicHeroMedia, { HeroAttribution } from "@/components/media/CinematicHeroMedia";
import MediaAttribution from "@/components/media/MediaAttribution";
import type { Destination } from "@/lib/destinations";

export default function DestinationHero({ destination }: { destination: Destination }) {
  const { media, loading } = useDestinationMedia(destination.slug, { placement: "hero" });
  const [coverSaved, setCoverSaved] = useState(false);

  const useAsCover = async () => {
    const hero = media?.hero;
    if (!hero) return;
    try {
      if (hero.source === "unsplash" && hero.downloadLocation) {
        // Genuine insert-like action: user adopts this image as their trip cover.
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ downloadLocation: hero.downloadLocation }),
        });
      }
      const raw = localStorage.getItem("tripifi_trip_covers");
      const covers = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      covers[destination.slug] = hero.src;
      localStorage.setItem("tripifi_trip_covers", JSON.stringify(covers));
      setCoverSaved(true);
      setTimeout(() => setCoverSaved(false), 2500);
    } catch {
      // storage/download failure must never break the page
    }
  };

  const gallery = media?.gallery?.length ? media.gallery : (destination.gallery ?? []).slice(0, 6).map((src, i) => ({
    id: `curated-${destination.slug}-${i}`,
    type: "image" as const,
    src,
    alt: `${destination.name} — Tripifi CGR`,
    source: "fallback" as const,
  }));

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-900/65 to-navy-900/25" />
          {loading || !media ? (
            <img
              src={destination.heroImage}
              alt={`${destination.name} - Tripifi CGR`}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <CinematicHeroMedia media={media} destinationName={destination.name} priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
        </div>
        {media && <HeroAttribution media={media} />}

        <div className="relative z-10 mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="micro-meta mb-3 text-[11px] text-white/70">
              {destination.region.toUpperCase()} · {destination.state.toUpperCase()}
            </p>
            <h1 className="fluid-hero font-display font-semibold text-white">{destination.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/90 sm:text-xl">{destination.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="/plan" className="btn-primary inline-flex min-h-[52px] justify-center shadow-glow">
                Plan My {destination.name} Trip
              </a>
              <a href="/packages" className="btn-ghost inline-flex min-h-[52px] justify-center bg-bg-elevated/90 backdrop-blur hover:bg-surface">
                View Packages
              </a>
              {media?.hero?.source === "unsplash" && (
                <button
                  onClick={useAsCover}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  {coverSaved ? "Saved as trip cover ✓" : "Use as trip cover"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-label={`${destination.name} gallery`} className="mx-auto mt-6 max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.slice(0, 4).map((g) => (
            <figure key={g.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
              {g.source === "unsplash" ? (
                <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <Image src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/70 to-transparent p-1 pt-6 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <MediaAttribution asset={g} compact />
              </div>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
