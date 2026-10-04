"use client";

import { useState } from "react";
import { useApp, type BookingType } from "@/lib/store";
import { DESTINATIONS } from "@/lib/destinations";

type AddKind = "destination" | "hotel" | "activity" | "cab" | "transport";

export default function TripCanvas() {
  const { currentTrip, ensureDraftTrip, updateTrip, addItemToTrip, removeItemFromTrip } = useApp();
  const [kind, setKind] = useState<AddKind | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const trip = currentTrip;
  const items = trip?.items ?? [];

  const submit = () => {
    if (!title.trim()) return;
    const t = trip ?? ensureDraftTrip({});
    const type: BookingType = kind === "hotel" ? "hotel" : kind === "cab" || kind === "transport" ? "cab" : "custom";
    addItemToTrip(t.id, {
      type,
      title: title.trim(),
      date: t.startDate,
      amount: Math.max(0, parseInt(amount, 10) || 0),
      status: "upcoming",
      details: kind === "destination" ? { Destination: title.trim() } : { Note: "Added in Trip Builder" },
    });
    setTitle("");
    setAmount("");
    setKind(null);
  };

  const addDestination = (slug: string, name: string) => {
    const t = trip ?? ensureDraftTrip({});
    if (!t.destinations.includes(slug)) {
      updateTrip(t.id, { destinations: [...t.destinations, slug] });
    }
    addItemToTrip(t.id, {
      type: "custom",
      title: `Explore ${name}`,
      date: t.startDate,
      amount: 0,
      status: "upcoming",
      details: { Destination: slug },
    });
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="border-b border-ink-100 px-4 sm:px-5 py-4">
        <h3 className="text-base font-semibold text-ink-900">Trip Canvas</h3>
        <p className="text-xs text-ink-600">
          {trip ? `${trip.name} · ${items.length} item${items.length === 1 ? "" : "s"}` : "Add destinations, activities, hotels & transport"}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 thin-scrollbar">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="h-16 w-16 mx-auto rounded-full bg-navy-50 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-900">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h4 className="text-base font-semibold text-ink-900 mb-2">Start building your trip</h4>
              <p className="text-sm text-ink-600 leading-relaxed mb-4">
                Search destinations, add hotels, activities, or transport to start crafting your complete journey.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-ink-100 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="font-medium text-ink-900 truncate">{item.title}</div>
                  <div className="text-xs text-ink-500">₹{item.amount.toLocaleString("en-IN")} · {item.type}</div>
                </div>
                <button
                  onClick={() => trip && removeItemFromTrip(trip.id, item.id)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50"
                  aria-label={`Remove ${item.title}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {kind === null ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(["destination", "hotel", "activity", "cab"] as AddKind[]).map((k) => (
              <button key={k} onClick={() => setKind(k)} className="chip min-h-[44px] capitalize">
                Add {k === "cab" ? "Cab" : k}
              </button>
            ))}
          </div>
        ) : kind === "destination" ? (
          <div className="mt-4">
            <p className="input-label">Choose destination</p>
            <div className="grid grid-cols-2 gap-2">
              {DESTINATIONS.slice(0, 8).map((d) => (
                <button
                  key={d.slug}
                  onClick={() => {
                    addDestination(d.slug, d.name);
                    setKind(null);
                  }}
                  className="rounded-xl border border-ink-200 px-3 py-2.5 text-left text-sm font-medium text-ink-800 hover:border-saffron-400 min-h-[44px]"
                >
                  {d.name}
                </button>
              ))}
            </div>
            <button onClick={() => setKind(null)} className="mt-2 text-xs text-ink-500 underline min-h-[44px]">Cancel</button>
          </div>
        ) : (
          <div className="mt-4 space-y-2 rounded-xl border border-ink-100 p-3">
            <p className="input-label capitalize">Add {kind}</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === "hotel" ? "Hotel name" : kind === "cab" ? "e.g. Gangtok → Pelling transfer" : "e.g. Tsomgo Lake excursion"}
              className="field min-h-[52px]"
              aria-label={`${kind} title`}
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Estimated cost (₹)"
              inputMode="numeric"
              className="field min-h-[52px]"
              aria-label="Estimated cost in rupees"
            />
            <div className="flex gap-2">
              <button onClick={submit} disabled={!title.trim()} className="btn-primary min-h-[48px] flex-1 justify-center text-sm disabled:opacity-50">
                Add to Trip
              </button>
              <button onClick={() => { setKind(null); setTitle(""); setAmount(""); }} className="btn-ghost min-h-[48px] text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
