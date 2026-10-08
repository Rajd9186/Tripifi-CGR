"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ArrowRight, CalendarDays, Wallet, X } from "lucide-react";
import { DESTINATIONS, findDestination } from "@/lib/destinations";
import IndiaMap from "@/components/map/IndiaMap";
import Reveal from "@/components/journey/Reveal";
import EmptyState from "@/components/ui/EmptyState";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import WishlistButton from "@/components/ui/WishlistButton";

export default function MapClient() {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
    );
  }, [query]);

  const selected = selectedSlug ? findDestination(selectedSlug) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
      <p className="micro-meta text-[11px] uppercase text-[#FFB454]">Map</p>
      <h1 className="mt-2 font-display text-display-lg font-semibold tracking-tight text-[#F5F7FF]">
        Places across India
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F5F7FF]/70">
        Search, browse the map, and tap any marker for details.
      </p>

      <div className="relative mt-6">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#F5F7FF]/40"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search places, states, regions…"
          aria-label="Search places"
          className="field min-h-[52px] bg-white/[0.06] pl-12 text-[#F5F7FF] placeholder:text-[#F5F7FF]/35"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-xl text-[#F5F7FF]/50 hover:text-[#F5F7FF]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-6">
        <IndiaMap
          destinations={filtered}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No places found"
            description={`Nothing matches "${query}". Try another state, region, or destination name.`}
            actionLabel="View all destinations"
            actionHref="/destinations"
          />
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d, i) => (
            <Reveal as="li" key={d.slug} stagger={Math.min(i % 6, 8)}>
              <button
                type="button"
                onClick={() => setSelectedSlug(d.slug)}
                aria-label={`View ${d.name} details`}
                className="journey-press flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-left backdrop-blur-xl"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={d.heroImage}
                    alt=""
                    fill
                    sizes="64px"
                    loading="lazy"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-semibold text-[#F5F7FF]">
                    {d.name}
                  </span>
                  <span className="block truncate text-xs text-[#F5F7FF]/60">
                    {d.state} · {d.bestTime}
                  </span>
                </span>
                <MapPin className="h-5 w-5 shrink-0 text-[#FFB454]" aria-hidden="true" />
              </button>
            </Reveal>
          ))}
        </ul>
      )}

      <Sheet open={selected !== undefined && selected !== null} onOpenChange={(open) => !open && setSelectedSlug(null)}>
        <SheetContent side="bottom" size="md" className="mx-auto max-w-2xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FFB454]" aria-hidden="true" />
                  {selected.name}
                </SheetTitle>
                <SheetDescription>
                  {selected.state} · {selected.region}
                </SheetDescription>
              </SheetHeader>
              <div className="px-5 pb-2">
                <div className="relative h-44 overflow-hidden rounded-2xl">
                  <Image
                    src={selected.heroImage}
                    alt={`${selected.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="object-cover"
                  />
                  <div className="absolute right-3 top-3">
                    <WishlistButton id={selected.slug} label={selected.name} dark />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">
                  {selected.tagline}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-[#19C3B2]" aria-hidden="true" />
                    {selected.bestTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-[#FFB454]" aria-hidden="true" />
                    {selected.estimatedBudget}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-5 pt-3 sm:flex-row">
                <Link
                  href={`/destinations/${selected.slug}`}
                  className="journey-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFB454] px-5 text-sm font-semibold text-[#0B1026]"
                >
                  View details
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/plan"
                  className="journey-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-[#F5F7FF]"
                >
                  Plan a trip
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
