"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CabCard from "@/components/cabs/CabCard";
import { searchCabs, type SearchMeta } from "@/lib/api";
import type { CabResult, CabOffer, SearchMode } from "@/lib/api/types";
import Badge from "@/components/ui/Badge";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import AssistedFallbackCard from "@/components/booking/AssistedFallbackCard";
import { SourceBadge } from "@/components/booking/ProviderStatusBadge";
import { useApp } from "@/lib/store";
import type { CabTripType } from "@/lib/providers/cabPricing";
import { addSearchToHistory } from "@/lib/searchHistory";

const VEHICLES = ["All Vehicles", "Sedan", "SUV", "Premium SUV", "Luxury"];

export default function CabResultsClient() {
  const params = useSearchParams();
  const { ensureDraftTrip, addItemToTrip, toast } = useApp();
  const pickup = params.get("pickup") ?? "Kolkata Airport";
  const drop = params.get("drop") ?? "Park Street";
  const trip = (params.get("trip") ?? "oneway") as CabTripType;
  const [vehicle, setVehicle] = useState(params.get("vehicle") ?? "All Vehicles");
  const [offers, setOffers] = useState<CabResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchCabs({ origin: pickup, destination: drop })
      .then((r) => {
        if (cancelled) return;
        setOffers(r.results);
        setMeta(r.meta);
        setLoading(false);
        addSearchToHistory({
          type: "cab",
          label: `${pickup} → ${drop} · ${trip}`,
          params: { pickup, drop, trip },
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
  }, [pickup, drop, refreshKey]);

  const visible = vehicle === "All Vehicles" ? offers : offers.filter((o) => o.vehicle_type === vehicle);

  const handleSelect = (cab: CabOffer) => {
    setSelected(cab.id);
    const t = ensureDraftTrip({ origin: pickup, destination: drop });
    addItemToTrip(t.id, {
      type: "cab",
      title: `${cab.vehicle_model} · ${pickup} → ${drop}`,
      route: `${pickup} → ${drop}`,
      date: params.get("datetime") ?? "",
      amount: cab.price,
      status: "upcoming",
      details: { Vehicle: `${cab.vehicle_model} (${cab.vehicle_type})`, Trip: trip, Cancellation: cab.cancellation_policy, Pricing: "Estimated fare — requires confirmation" },
    });
    toast(`Cab added to ${t.name}`, "success");
  };

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">{pickup.toUpperCase()} → {drop.toUpperCase()}</p>
          <h1 className="fluid-section mt-1 font-display font-semibold tracking-tight text-white">Available Cabs</h1>
          <p className="mt-2 text-[15px] text-white/80">
            {trip} · <span className="italic">Estimated fares — booking requires confirmation</span>
          </p>
          <Link href="/cabs" className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/10">
            Modify search
          </Link>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-8xl mx-auto">
          <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by vehicle">
            <Badge variant="info">{trip}</Badge>
            {meta && (
              <SourceBadge
                mode={(meta.mode ?? "ASSISTED") as SearchMode}
                source={meta.source}
                fetchedAt={meta.fetched_at}
                onRefresh={() => setRefreshKey((k) => k + 1)}
                refreshing={loading}
              />
            )}
            {VEHICLES.map((v) => (
              <button
                key={v}
                onClick={() => setVehicle(v)}
                aria-pressed={vehicle === v}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-medium ${vehicle === v ? "border-saffron-500 bg-saffron-500 text-white" : "border-ink-200 bg-surface text-ink-700"}`}
              >
                {v}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4" aria-label="Loading cabs">
              {[0, 1].map((i) => (
                <div key={i} className="card p-4 sm:p-6">
                  <div className="skeleton h-6 w-48" />
                  <div className="skeleton mt-4 h-24 w-full" />
                </div>
              ))}
            </div>
          ) : error && visible.length === 0 ? (
            <>
              <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />
              <p className="mt-3 text-center text-sm text-ink-600" role="alert">{error}</p>
            </>
          ) : visible.length === 0 ? (
            <EmptyState title="No cabs match that vehicle filter." description="Try another vehicle category." actionLabel="Modify search" actionHref="/cabs" />
          ) : (
            <div className="space-y-4">
              {visible.map((cab) => (
                <CabCard key={cab.id} cab={cab} tripType={trip} selected={selected === cab.id} onSelect={handleSelect} onAddToTrip={handleSelect} />
              ))}
            </div>
          )}

          <div className="mt-6">
            <AssistedFallbackCard
              type="CAB"
              title="Need help arranging this cab?"
              description="Fares above are estimates from our pricing engine. Share your details and a customer representative will contact you shortly to confirm the vehicle and final fare."
              prefill={{
                serviceLabel: "Cab",
                origin: pickup,
                destination: drop,
              }}
              summary={[
                { label: "Service", value: "Private cab" },
                { label: "Pickup", value: pickup },
                { label: "Drop", value: drop },
                { label: "Trip", value: trip },
                { label: "Vehicle", value: vehicle },
              ]}
            />
          </div>

          {selected && (
            <div className="sticky bottom-[96px] mt-6 md:bottom-6">
              <div className="card flex items-center justify-between gap-3 p-4 safe-bottom">
                <div className="text-sm text-ink-700">Cab selected — added to your journey.</div>
                <Link href="/plan" className="btn-primary min-h-[48px] shrink-0">Review Trip</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
