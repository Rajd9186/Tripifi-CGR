"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/destinations";
import { cn } from "@/lib/utils";
import { useDestinationMedia } from "@/lib/media/media-provider";
import CinematicHeroMedia, { HeroAttribution } from "@/components/media/CinematicHeroMedia";
import { RouteVisualization, DataChip } from "@/components/graphics/RouteVisualization";

const HERO_DESTINATIONS = [
  "kashmir",
  "ladakh",
  "sikkim",
  "kerala",
  "rajasthan",
  "goa",
  "meghalaya",
].map((slug) => DESTINATIONS.find((d) => d.slug === slug)).filter((d): d is NonNullable<typeof d> => Boolean(d));

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % HERO_DESTINATIONS.length);
    transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 1200);
  }, [isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + HERO_DESTINATIONS.length) % HERO_DESTINATIONS.length);
    transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 1200);
  }, [isTransitioning]);

  const goToIndex = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 1200);
  }, [isTransitioning, currentIndex]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    intervalRef.current = setInterval(goToNext, 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [goToNext, prefersReducedMotion]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  const currentDest = HERO_DESTINATIONS[currentIndex];
  const { media: currentMedia } = useDestinationMedia(currentDest?.slug ?? "kashmir", { placement: "hero" });

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0" role="img" aria-label="Hero destination carousel">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/30" aria-hidden="true" />

        <div className="absolute inset-0 overflow-hidden">
          {HERO_DESTINATIONS.map((dest, index) => {
            const active = index === currentIndex;
            return (
              <div
                key={dest.slug}
                className={cn(
                  "absolute inset-0 transition-all duration-1000 ease-in-out",
                  active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
                style={{
                  transform: active ? "scale(1)" : "scale(1.02)",
                  filter: active ? "brightness(1) contrast(1)" : "brightness(0.95)",
                }}
                aria-hidden={!active}
              >
                {active && currentMedia ? (
                  <CinematicHeroMedia media={currentMedia} destinationName={dest.name} destinationSlug={dest.slug} priority={index === 0} />
                ) : (
                  <>
                    <img
                      src={dest.heroImage}
                      alt={`${dest.name} - Tripifi CGR`}
                      className="h-full w-full object-cover object-center"
                      loading={index === currentIndex ? "eager" : "lazy"}
                      onLoad={() => handleImageLoad(index)}
                    />
                    {!loadedImages.has(index) && (
                      <div className="absolute inset-0 bg-navy-900 animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
                    )}
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/30 to-navy-950/60" />
              </div>
            );
          })}

          {/* Static legibility gradients only — no animated glow sweeps. */}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 via-indigo-950/40 to-purple-950/30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,122,0,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(27,154,170,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
        {currentMedia && <HeroAttribution media={currentMedia} />}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 animate-fade-up-delayed-3">
        <button
          onClick={goToPrev}
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
          aria-label="Previous destination"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Destination indicators">
          {HERO_DESTINATIONS.map((dest, index) => (
            <button
              key={dest.slug}
              onClick={() => goToIndex(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/60"
              )}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`View ${dest.name}`}
            />
          ))}
        </div>
        <button
          onClick={goToNext}
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
          aria-label="Next destination"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 animate-fade-up mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron-400"></span>
            </span>
            Cinematic India
          </div>
          <h1 className="font-display fluid-hero font-semibold text-white animate-fade-up">
            Your trip. <span className="bg-gradient-to-r from-saffron-400 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">Your way.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl animate-fade-up-delayed">
            Plan, personalize and book your entire Indian journey in one place.
            <span className="hidden sm:inline">
              {" "}
              Don't just book a ticket. Build the entire journey.
            </span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 animate-fade-up-delayed-2">
            <Link href="/plan" className="btn-primary inline-flex min-h-[52px] w-full justify-center shadow-glow bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600 group sm:w-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Plan a Trip
            </Link>
            <Link href="/destinations" className="btn-ghost inline-flex min-h-[52px] w-full justify-center bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 group sm:w-auto">
              Explore India
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>

          <div className="mt-8 max-w-xl rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md animate-fade-up-delayed-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <DataChip variant="dark">KOLKATA · CCU</DataChip>
              <DataChip variant="dark">27.5°N 88.6°E</DataChip>
              <DataChip variant="dark">6 DAYS</DataChip>
            </div>
            <RouteVisualization from="Kolkata" to={currentDest?.name ?? "Gangtok"} meta="1,480 KM · 4H 20M" variant="dark" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/80 animate-fade-up-delayed-3">
            <div className="flex items-center gap-2 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Verified partners across India
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Real-time itinerary builder
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Secure bookings & payments
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-image-zoom,
          .animate-camera-drift,
          .animate-breathe,
          .animate-mist-shift,
          .animate-fade-up,
          .animate-fade-up-delayed,
          .animate-fade-up-delayed-2,
          .animate-fade-up-delayed-3 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}