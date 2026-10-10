"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TrainCard from "@/components/trains/TrainCard";
import { modeNote, searchTrains, type SearchMeta } from "@/lib/api";
import type { TrainResult, TrainOffer, SearchMode } from "@/lib/api/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import AssistedFallbackCard from "@/components/booking/AssistedFallbackCard";
import { SourceBadge } from "@/components/booking/ProviderStatusBadge";
import { useApp } from "@/lib/store";
import { addSearchToHistory } from "@/lib/searchHistory";

const CLASSES = ["All Classes", "1A", "2A", "3A", "SL", "CC", "EC"];

export default function TrainResultsClient() {
  const params = useSearchParams();
  const { ensureDraftTrip, addItemToTrip, toast } = useApp();
  const from = params.get("from") ?? "Howrah (HWH)";
  const to = params.get("to") ?? "New Delhi (NDLS)";
  const date = params.get("date") ?? "";

  const [offers, setOffers] = useState<TrainResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [classFilter, setClassFilter] = useState(params.get("class") ?? "All Classes");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchTrains({ origin: from, destination: to, departure_date: date || undefined })
      .then((r) => {
        if (cancelled) return;
        setOffers(r.results);
        setMeta(r.meta);
        setLoading(false);
        addSearchToHistory({
          type: "train",
          label: `${from} → ${to}${date ? ` · ${date}` : ""}`,
          params: { origin: from, destination: to, departure_date: date },
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
  }, [from, to, date, refreshKey]);

  const visible = useMemo(
    () => (classFilter === "All Classes" ? offers : offers.filter((o) => o.travel_class === classFilter)),
    [offers, classFilter]
  );

  const handleSelect = (train: TrainOffer, travelClass: string) => {
    const key = `${train.id}-${travelClass}`;
    setSelected(key);
    const trip = ensureDraftTrip({ origin: from, destination: to, startDate: date });
    addItemToTrip(trip.id, {
      type: "train",
      title: `${train.train_name} ${train.train_number} · ${from} → ${to}`,
      route: `${train.origin} → ${train.destination}`,
      date,
      amount: train.fare ?? 0,
      status: "upcoming",
      details: { Class: travelClass, Departure: train.departure, Arrival: train.arrival, Availability: train.availability },
    });
    toast(`Train added to ${trip.name}`, "success");
  };

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">{from.toUpperCase()} → {to.toUpperCase()}</p>
          <h1 className="fluid-section mt-1 font-display font-semibold tracking-tight text-white">Train Results</h1>
          <p className="mt-2 text-[15px] text-white/80">
            {date || "Flexible dates"}
            {modeNote(meta, offers.some((o) => o.is_demo)) && (
              <>
                {" "}· <span className="italic">{modeNote(meta, offers.some((o) => o.is_demo))}</span>
              </>
            )}
          </p>
          <Link href="/trains" className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/10">
            Modify search
          </Link>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-8xl mx-auto">
          <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by class">
            {CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => setClassFilter(c)}
                aria-pressed={classFilter === c}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-medium ${classFilter === c ? "border-saffron-500 bg-saffron-500 text-[#10161C]" : "border-ink-200 bg-surface text-ink-700"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {meta && (
              <SourceBadge
                mode={(meta.mode ?? "ASSISTED") as SearchMode}
                source={meta.source}
                fetchedAt={meta.fetched_at}
                onRefresh={() => setRefreshKey((k) => k + 1)}
                refreshing={loading}
              />
            )}
          </div>

          {loading ? (
            <div className="space-y-4" aria-label="Loading trains">
              {[0, 1].map((i) => (
                <div key={i} className="card p-4 sm:p-6">
                  <div className="skeleton h-6 w-56" />
                  <div className="skeleton mt-4 h-16 w-full" />
                </div>
              ))}
            </div>
          ) : error && visible.length === 0 ? (
            <>
              <ErrorState onRetry={() => setRefreshKey((k) => k + 1)} />
              <p className="mt-3 text-center text-sm text-ink-600" role="alert">{error}</p>
            </>
          ) : visible.length === 0 ? (
            <EmptyState title="No live train data available." description="Share your journey details and a travel associate will arrange your tickets." actionLabel="Request train assistance" actionHref="/assistance?type=TRAIN" />
          ) : (
            <div className="space-y-4">
              {visible.map((train) => (
                <TrainCard
                  key={`${train.id}-${train.travel_class}`}
                  train={train}
                  selected={selected === `${train.id}-${train.travel_class}`}
                  selectedClass={train.travel_class}
                  onSelect={handleSelect}
                  onAddToTrip={handleSelect}
                />
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-sm text-ink-600">
            <Badge variant="default">Assisted booking</Badge>
            <span>Live railway inventory isn't available — booking via assistance.</span>
          </div>

          <div className="mt-6">
            <AssistedFallbackCard
              type="TRAIN"
              title="Request train booking assistance"
              description="Live railway booking isn't available yet. Share your details and a customer representative will contact you shortly to arrange your tickets."
              prefill={{
                serviceLabel: "Train",
                origin: from,
                destination: to,
                travel_start_date: date || undefined,
              }}
              summary={[
                { label: "Service", value: "Train" },
                { label: "From", value: from },
                { label: "To", value: to },
                ...(date ? [{ label: "Date", value: date }] : []),
                { label: "Class", value: classFilter },
              ]}
            />
          </div>

          <Card className="mt-6 text-center" padding="md">
            <p className="text-sm text-ink-600">
              <span className="font-medium">Note:</span> Live railway inventory isn't available — share your details below and a travel associate will arrange tickets.
            </p>
          </Card>

          {selected && (
            <div className="sticky bottom-[96px] mt-6 md:bottom-6">
              <div className="card flex items-center justify-between gap-3 p-4 safe-bottom">
                <div className="text-sm text-ink-700">Train selected — added to your journey.</div>
                <Link href="/plan" className="btn-primary min-h-[48px] shrink-0">Review Trip</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
