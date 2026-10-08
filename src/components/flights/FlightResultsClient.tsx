"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FlightCard from "@/components/flights/FlightCard";
import { searchFlights } from "@/lib/api";
import type { FlightResult, FlightOffer } from "@/lib/api/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import BottomSheet from "@/components/ui/BottomSheet";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import AssistedBookingCTA from "@/components/booking/AssistedBookingCTA";
import { useApp } from "@/lib/store";
import { addSearchToHistory } from "@/lib/searchHistory";

const FILTERS = ["Non-stop", "Morning", "Refundable", "Under ₹12,000"];
const SORTS = ["Recommended", "Cheapest", "Fastest", "Earliest"] as const;
type Sort = (typeof SORTS)[number];

function hourOf(t: string): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  return m ? parseInt(m[1], 10) : 99;
}

export default function FlightResultsClient() {
  const params = useSearchParams();
  const { ensureDraftTrip, addItemToTrip, toast } = useApp();
  const from = params.get("from") ?? "Kolkata (CCU)";
  const to = params.get("to") ?? "Delhi (DEL)";
  const date = params.get("date") ?? "";
  const travellers = Math.max(1, parseInt(params.get("travellers") ?? "1", 10) || 1);
  const cabin = params.get("class") ?? "Economy";

  const [offers, setOffers] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("Recommended");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchFlights({ origin: from, destination: to, departure_date: date || undefined, travellers })
      .then((r) => {
        if (cancelled) return;
        setOffers(r.results);
        setLoading(false);
        // Add to search history on successful search
        addSearchToHistory({
          type: "flight",
          label: `${from} → ${to}${date ? ` · ${date}` : ""} · ${travellers} traveller${travellers > 1 ? "s" : ""}`,
          params: { origin: from, destination: to, departure_date: date, travellers: String(travellers) },
        });
      })
      .catch((e: Error & { code?: string }) => {
        if (cancelled) return;
        if (e.code === "NO_RESULTS") {
          setOffers([]);
        } else {
          setError("We couldn't retrieve live availability right now.");
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, date]);

  const toggleFilter = (f: string) => {
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const visible = useMemo(() => {
    let list = [...offers];
    if (activeFilters.includes("Non-stop")) list = list.filter((o) => o.stops === 0);
    if (activeFilters.includes("Refundable")) list = list.filter((o) => o.refundable);
    if (activeFilters.includes("Morning")) list = list.filter((o) => hourOf(o.departure) < 12);
    if (activeFilters.includes("Under ₹12,000")) list = list.filter((o) => o.fare != null && o.fare < 12000);
    switch (sort) {
      case "Cheapest":
        list.sort((a, b) => (a.fare ?? Number.MAX_SAFE_INTEGER) - (b.fare ?? Number.MAX_SAFE_INTEGER));
        break;
      case "Fastest":
        list.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
      case "Earliest":
        list.sort((a, b) => hourOf(a.departure) - hourOf(b.departure));
        break;
      default:
        break;
    }
    return list;
  }, [offers, activeFilters, sort]);

  const handleSelect = (flight: FlightOffer) => {
    setSelectedId(flight.id);
    const trip = ensureDraftTrip({ origin: from, destination: to, startDate: date, travellers });
    addItemToTrip(trip.id, {
      type: "flight",
      title: `${flight.airline} ${flight.flight_number} · ${from} → ${to}`,
      route: `${flight.origin} → ${flight.destination}`,
      date,
      amount: flight.fare != null ? flight.fare * travellers : 0,
      status: "upcoming",
      details: {
        Airline: flight.airline,
        Departure: flight.departure,
        Arrival: flight.arrival,
        Class: cabin,
        Baggage: `${flight.baggage_kg} kg check-in`,
        Provider: `${flight.provider}${flight.is_demo ? " (demo)" : ""}`,
      },
    });
    toast(`Flight added to ${trip.name}`, "success");
  };

  const handleAddToTrip = (flight: FlightOffer) => {
    handleSelect(flight);
  };

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">
            {from.toUpperCase()} → {to.toUpperCase()}
          </p>
          <h1 className="fluid-section mt-1 font-display font-semibold tracking-tight text-white">
            Flight Results
          </h1>
          <p className="mt-2 text-[15px] text-white/80">
            {date || "Flexible dates"} · {travellers} traveller{travellers > 1 ? "s" : ""} · {cabin} ·{" "}
            <span className="italic">Demo availability</span>
          </p>
          <Link
            href={`/flights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`}
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/10"
          >
            Modify search
          </Link>
        </div>
      </section>

      <div className="sticky top-16 md:top-[var(--header-h)] z-sticky border-b border-ink-100 bg-cream-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-8xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface px-4 text-sm font-semibold text-ink-800 md:flex-none"
            aria-haspopup="dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
          </button>
          <label className="inline-flex min-h-[44px] flex-1 items-center gap-2 rounded-xl border border-ink-200 bg-surface px-4 text-sm md:flex-none">
            <span className="sr-only">Sort results</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="15" y2="6" />
              <line x1="3" y1="12" x2="11" y2="12" />
              <line x1="3" y1="18" x2="7" y2="18" />
            </svg>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
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
              <Badge variant="info">{cabin}</Badge>
              <Badge variant="default">{sort}</Badge>
            </div>
            <p className="text-sm text-ink-600">
              {loading ? "Searching flights…" : `Showing ${visible.length} flight${visible.length === 1 ? "" : "s"}`} ·{" "}
              <span className="italic">Demo availability</span>
            </p>
          </div>

          {loading ? (
            <div className="space-y-4" aria-label="Loading flights">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card p-4 sm:p-6">
                  <div className="skeleton h-6 w-48" />
                  <div className="skeleton mt-4 h-16 w-full" />
                  <div className="skeleton mt-4 h-10 w-40" />
                </div>
              ))}
            </div>
          ) : error && visible.length === 0 ? (
            <ErrorState onRetry={() => window.location.reload()} />
          ) : visible.length === 0 ? (
            <EmptyState
              title="No flights found for these dates."
              description="Try changing your dates, destination, or removing filters."
              actionLabel="Modify search"
              actionHref="/flights"
            />
          ) : (
            <div className="space-y-4">
              {visible.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  selected={selectedId === flight.id}
                  onSelect={handleSelect}
                  onAddToTrip={handleAddToTrip}
                />
              ))}
            </div>
          )}

          <Card className="mt-6 text-center" padding="md">
            <p className="text-sm text-ink-600">
              <span className="font-medium">Note:</span> These are simulated fares for demonstration purposes only. Actual prices and availability may
              vary.
            </p>
          </Card>

          <div className="mt-6">
            <AssistedBookingCTA
              title="Need help booking this flight?"
              description="Flight information can't be ticketed instantly yet. Share your details and our travel team will check availability and arrange the best option."
              href="/assistance"
              prefill={{ type: "FLIGHT" }}
            />
          </div>

          {selectedId && (
            <div className="sticky bottom-[96px] mt-6 md:bottom-6">
              <div className="card flex items-center justify-between gap-3 p-4 safe-bottom">
                <div className="text-sm text-ink-700">
                  Flight selected — added to your journey.
                </div>
                <Link href="/plan" className="btn-primary min-h-[48px] shrink-0">
                  Review Trip
                </Link>
              </div>
            </div>
          )}
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
                      : "border-ink-200 bg-surface text-ink-700"
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
                      : "border-ink-200 bg-surface text-ink-700"
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
