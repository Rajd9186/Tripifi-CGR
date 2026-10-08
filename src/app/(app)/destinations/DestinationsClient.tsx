"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { DESTINATIONS } from "@/lib/destinations";
import DestinationCard from "@/components/destinations/DestinationCard";
import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/journey/Reveal";
import { cn } from "@/lib/utils";

const REGIONS = [
  { name: "All", slug: "all" },
  { name: "North India", slug: "north" },
  { name: "South India", slug: "south" },
  { name: "East India", slug: "east" },
  { name: "West India", slug: "west" },
  { name: "Islands", slug: "islands" },
];

export default function DestinationsPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DESTINATIONS.filter((d) => {
      const matchesRegion =
        region === "all" || d.region.toLowerCase().includes(region);
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [query, region]);

  return (
    <div className="pb-16">
      <section className="relative flex h-[60vh] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/30" />
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
            alt="India destinations - Tripifi CGR"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Explore India
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/90 sm:text-xl">
              Discover the diverse beauty of India. From the Himalayas to the
              coast, find your next adventure with Tripifi CGR.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-8xl">
          <div className="card p-4 sm:p-6">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, states…"
                aria-label="Search destinations"
                className="field min-h-[52px] pl-12"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-xl text-text-muted hover:text-text"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div
              className="mt-4 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter by region"
            >
              {REGIONS.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setRegion(category.slug)}
                  aria-pressed={region === category.slug}
                  className={cn("chip min-h-[44px]", region === category.slug && "chip-active")}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-8xl">
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            {region === "all" ? "All Destinations" : REGIONS.find((r) => r.slug === region)?.name}
            <span className="ml-3 align-middle text-sm font-normal text-text-muted">
              {filtered.length} {filtered.length === 1 ? "place" : "places"}
            </span>
          </h2>
          {filtered.length === 0 ? (
            <EmptyState
              title="No destinations found"
              description={
                query
                  ? `Nothing matches "${query}" in this region. Try a different search or region.`
                  : "No destinations in this region yet. Try another region."
              }
              actionLabel="Plan a Custom Trip"
              actionHref="/plan"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((destination, i) => (
                <Reveal key={destination.slug} stagger={Math.min(i % 8, 8)}>
                  <DestinationCard destination={destination} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-8xl">
          <div className="card p-6 text-center sm:p-10">
            <h3 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-base text-ink-600">
              Tell us your preferences and Tripifi CGR will build a custom trip
              just for you.
            </p>
            <div className="mt-6">
              <Link href="/plan" className="btn-primary journey-press journey-cta-glow">
                Plan a Custom Trip
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
