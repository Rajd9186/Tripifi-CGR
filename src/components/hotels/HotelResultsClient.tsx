"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HotelCard from "@/components/hotels/HotelCard";
import { hotelProvider } from "@/lib/providers/providers";
import type { HotelOffer } from "@/lib/api/types";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import AssistedBookingCTA from "@/components/booking/AssistedBookingCTA";
import { useApp } from "@/lib/store";
import { nightsBetween } from "@/lib/utils";

export default function HotelResultsClient() {
  const params = useSearchParams();
  const { ensureDraftTrip, addItemToTrip, toast } = useApp();
  const destination = params.get("destination") ?? "Gangtok";
  const checkin = params.get("checkin") ?? "";
  const checkout = params.get("checkout") ?? "";
  const guests = params.get("guests") ?? "2 Guests, 1 Room";

  const nights = checkin && checkout ? Math.max(1, nightsBetween(checkin, checkout)) : 3;
  const [offers, setOffers] = useState<HotelOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    hotelProvider
      .searchHotels({ destination })
      .then((r) => {
        if (cancelled) return;
        setOffers(r.results);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  const handleSelect = (hotel: HotelOffer) => {
    setSelected(hotel.id);
    const trip = ensureDraftTrip({ destination, startDate: checkin, endDate: checkout });
    const total = hotel.total_price || hotel.price_per_night * nights;
    addItemToTrip(trip.id, {
      type: "hotel",
      title: `${hotel.name} · ${destination} (${nights} night${nights > 1 ? "s" : ""})`,
      route: destination,
      date: checkin,
      amount: total,
      status: "upcoming",
      details: { Room: hotel.room_type, Guests: guests, Cancellation: `${hotel.cancellation_policy} (simulated)`, Meals: hotel.meal_plan },
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
            {checkin || "Flexible dates"}{checkout ? ` → ${checkout}` : ""} · {guests} · <span className="italic">Simulated inventory</span>
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-8xl mx-auto">
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
            <ErrorState onRetry={() => window.location.reload()} />
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
            <AssistedBookingCTA
              title="Let Tripifi find the right hotel for you"
              description="Tell us your dates, budget and preferences — our travel team will arrange suitable options and confirm availability."
              href="/assistance"
              prefill={{ type: "HOTEL" }}
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
