"use client";

import { useState } from "react";
import FlightCard from "@/components/flights/FlightCard";
import { MOCK_FLIGHTS } from "@/data/mockFlights";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import BottomSheet from "@/components/ui/BottomSheet";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";

const FILTERS = ["Non-stop", "Morning", "Refundable", "Under ₹12,000"];
const SORTS = ["Recommended", "Cheapest", "Fastest", "Earliest"];

export default function FlightResultsClient() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(["Non-stop"]);
  const [sort, setSort] = useState("Recommended");

  const toggleFilter = (f: string) => {
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">KOLKATA · CCU → DELHI · DEL</p>
          <h1 className="fluid-section mt-1 font-display font-semibold tracking-tight text-white">
            Flight Results
          </h1>
          <p className="mt-2 text-[15px] text-white/80">
            12 Dec · 2 travellers · Economy • <span className="italic">Simulated availability</span>
          </p>
        </div>
      </section>

      <div className="sticky top-[60px] z-sticky border-b border-ink-100 bg-cream-50/95 backdrop-blur md:top-[60px]">
        <div className="mx-auto flex max-w-8xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-800 md:flex-none"
            aria-haspopup="dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
          </button>
          <label className="inline-flex min-h-[44px] flex-1 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm md:flex-none">
            <span className="sr-only">Sort results</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="15" y2="6" />
              <line x1="3" y1="12" x2="11" y2="12" />
              <line x1="3" y1="18" x2="7" y2="18" />
            </svg>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-ink-800 outline-none"
              aria-label="Sort results"
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        {activeFilters.length > 0 && (
          <div className="mx-auto flex max-w-8xl gap-2 overflow-x-auto px-4 pb-3 no-scrollbar sm:px-6 lg:px-8">
            {activeFilters.map((f) => (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full bg-navy-900 px-3 text-xs font-medium text-white"
                aria-label={`Remove filter ${f}`}
              >
                {f} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-8xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Non-stop</Badge>
              <Badge variant="default">Economy</Badge>
              <Badge variant="default">{sort}</Badge>
            </div>
            <p className="text-sm text-ink-600">
              Showing {MOCK_FLIGHTS.slice(0, 4).length} flights · <span className="italic">Demo availability</span>
            </p>
          </div>

          <div className="space-y-4">
            {MOCK_FLIGHTS.slice(0, 4).map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>

          <Card className="mt-6 text-center" padding="md">
            <p className="text-sm text-ink-600">
              <span className="font-medium">Note:</span> These are simulated fares for demonstration purposes only. Actual prices and availability may vary.
            </p>
          </Card>

          <div className="mt-8 hidden">
            <EmptyState
              title="No flights found"
              description="Try changing your dates or destination."
              actionLabel="Change search"
              actionHref="/flights"
            />
            <ErrorState onRetry={() => window.location.reload()} />
          </div>
        </div>
      </section>

      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <div className="space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Quick filters</h3>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFilter(f)}
                  aria-pressed={activeFilters.includes(f)}
                  className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-medium transition-all ${
                    activeFilters.includes(f)
                      ? "border-saffron-500 bg-saffron-500 text-white"
                      : "border-ink-200 bg-white text-ink-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Sort by</h3>
            <div className="grid grid-cols-2 gap-2">
              {SORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  aria-pressed={sort === s}
                  className={`inline-flex min-h-[48px] items-center justify-center rounded-xl border px-4 text-sm font-medium transition-all ${
                    sort === s
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-ink-200 bg-white text-ink-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setFiltersOpen(false)} className="btn-primary min-h-[52px] w-full justify-center">
            Show results
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
