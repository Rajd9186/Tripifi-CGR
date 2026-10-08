"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HotelCard from "@/components/hotels/HotelCard";
import { modeNote, searchHotels, type SearchMeta } from "@/lib/api";
import type { HotelResult, HotelOffer, SearchMode } from "@/lib/api/types";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import AssistedFallbackCard from "@/components/booking/AssistedFallbackCard";
import { SourceBadge } from "@/components/booking/ProviderStatusBadge";
import { useApp } from "@/lib/store";
import { nightsBetween } from "@/lib/utils";
import { addSearchToHistory } from "@/lib/searchHistory";

export default function HotelResultsClient() {
  const params = useSearchParams();
  const { ensureDraftTrip, addItemToTrip, toast } = useApp();
  const destination = params.get("destination") ?? "Gangtok";
  const checkin = params.get("checkin") ?? "";
  const checkout = params.get("checkout") ?? "";
  const guests = params.get("guests") ?? "2 Guests, 1 Room";

  const nights = checkin && checkout ? Math.max(1, nightsBetween(checkin, checkout)) : 3;
  const [offers, setOffers] = useState<HotelResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchHotels({ destination, checkin: checkin || undefined, checkout: checkout || undefined, guests: 2 })
      .then((r) => {
        if (cancelled) return;
        setOffers(r.results);
        setMeta(r.meta);
        setLoading(false);
        addSearchToHistory({
          type: "hotel",
          label: `${destination}${checkin ? ` · ${checkin}` : ""}${checkout ? ` → ${checkout}` : ""} · ${nights} night${nights > 1 ? "s" : ""}`,
          params: { destination, checkin, checkout, guests: "2" },
        });
      })
      .catch((e: Error & { code?: string }) => {
        if (cancelled) return;
        if (e.code === "NO_RESULTS") {
          setOffers([]);
        } else {
          setError(e.code === "SERVER_WAKING" || e.code === "NETWORK"
            ? "Server is waking up, retrying… If this persists, request assistance below and keep your details."
            : "We couldn't retrieve live availability right now.");
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, checkin, checkout, refreshKey]);

  const handleSelect = (hotel: HotelOffer) => {
    setSelected(hotel.id);
    const trip = ensureDraftTrip({ destination, startDate: checkin, endDate: checkout });
    const total = hotel.total_price ?? (hotel.price_per_night != null ? hotel.price_per_night * nights : 0);
    addItemToTrip(trip.id, {
      type: "hotel",
      title: `${hotel.name} · ${destination} (${nights} night${nights > 1 ? "s" : ""})`,
      route: destination,
      date: checkin,
      amount: total,
      status: "upcoming",
      details: {
        Room: hotel.room_type ?? "Details on request",
        Guests: guests,
        Cancellation: `${hotel.cancellation_policy ?? "Details on request"}${hotel.is_demo ? " (simulated)" : ""}`,
        Meals: hotel.meal_plan ?? "Details on request",
      },
    });
    toast(`Hotel added to ${trip.name}`, "success");
  };

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">{destination.toUpperCase()} · {nights} NIGHT{nights > 1 ? "S" : ""}</p>
          <h1 className="fluid-section mt-1 font-display font-semibold tracking-tight text-white">Hotel Results</h1>
          <p className="mt-2 text-[15px] text-white/80">
            {checkin || "Flexible dates"}{checkout ? ` → ${checkout}` : ""} · {guests}
            {modeNote(meta, offers.some((o) => o.is_demo)) && (
              <>
                {" "}· <span className="italic">{modeNote(meta, offers.some((o) => o.is_demo))}</span>
              </>
            )}
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-8xl mx-auto">
          {meta && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <SourceBadge
                mode={(meta.mode ?? "ASSISTED") as SearchMode}
                source={meta.source}
                fetchedAt={meta.fetched_at}
                onRefresh={() => setRefreshKey((k) => k + 1)}
                refreshing={loading}
              />
            </div>
          )}
          {loading ? (
            <div className="space-y-4" aria-label="Loading hotels">
              {[0, 1].map((i) => (
                <div key={i} className="card p-4 sm:p-6">
                  <div className="skeleton h-6 w-56" />
                  <div className="skeleton mt-4 h-24 w-full" />
                </div>
              ))}
            </div>
          ) : error && offers.length === 0 ? (
            <>
              <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />
              <p className="mt-3 text-center text-sm text-ink-600" role="alert">{error}</p>
            </>
          ) : offers.length === 0 ? (
            <EmptyState title="We couldn't find a stay matching those preferences." description="Try other dates or a nearby destination — or let our team help." actionLabel="Request hotel assistance" actionHref="/assistance?type=HOTEL" />
          ) : (
            <div className="space-y-4">
              {offers.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} nights={nights} selected={selected === hotel.id} onSelect={handleSelect} onAddToTrip={handleSelect} />
              ))}
            </div>
          )}

          <div className="mt-6">
            <AssistedFallbackCard
              type="HOTEL"
              title="Let Tripifi find the right hotel for you"
              description="Tell us your dates, budget and preferences — a customer representative will contact you shortly to arrange suitable options and confirm availability."
              prefill={{
                serviceLabel: "Hotel",
                destination,
                travel_start_date: checkin || undefined,
                travel_end_date: checkout || undefined,
              }}
              summary={[
                { label: "Service", value: "Hotel" },
                { label: "Destination", value: destination },
                ...(checkin ? [{ label: "Check-in", value: checkin }] : []),
                ...(checkout ? [{ label: "Check-out", value: checkout }] : []),
                { label: "Nights", value: String(nights) },
                { label: "Guests", value: guests },
              ]}
            />
          </div>

          {selected && (
            <div className="sticky bottom-[96px] mt-6 md:bottom-6">
              <div className="card flex items-center justify-between gap-3 p-4 safe-bottom">
                <div className="text-sm text-ink-700">Hotel selected — added to your journey.</div>
                <Link href="/plan" className="btn-primary min-h-[48px] shrink-0">Review Trip</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
