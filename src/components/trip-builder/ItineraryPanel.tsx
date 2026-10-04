"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { buildItinerary, detectConflicts } from "@/lib/itinerary";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  flight: "✈ Flight",
  train: "🚂 Train",
  cab: "🚙 Cab",
  hotel: "🏨 Hotel",
  package: "🎒 Package",
  custom: "📍 Activity",
};

export default function ItineraryPanel() {
  const { currentTrip, ensureDraftTrip, updateTrip, removeItemFromTrip, updateTripItem } = useApp();

  const trip = currentTrip ?? null;
  const days = useMemo(
    () => buildItinerary(trip?.items ?? [], trip?.startDate ?? "", trip?.endDate ?? ""),
    [trip?.items, trip?.startDate, trip?.endDate]
  );
  const conflicts = useMemo(() => detectConflicts(days), [days]);

  const ensure = () => ensureDraftTrip({});

  const addDay = () => {
    const t = trip ?? ensure();
    const base = t.endDate || t.startDate || new Date().toISOString().slice(0, 10);
    const d = new Date(base + "T00:00:00");
    d.setDate(d.getDate() + 1);
    updateTrip(t.id, { endDate: d.toISOString().slice(0, 10) });
  };

  const removeDay = () => {
    const t = trip;
    if (!t || !t.endDate || !t.startDate || t.endDate <= t.startDate) return;
    const d = new Date(t.endDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    updateTrip(t.id, { endDate: d.toISOString().slice(0, 10) });
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="border-b border-ink-100 px-4 sm:px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Itinerary</h3>
          <p className="text-xs text-ink-600">{trip ? trip.name : "Plan your day-by-day journey"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={removeDay} className="chip min-h-[44px]" aria-label="Remove day">-</button>
          <span className="text-sm font-medium text-ink-900">{days.length} Day{days.length === 1 ? "" : "s"}</span>
          <button onClick={addDay} className="chip min-h-[44px]" aria-label="Add day">+</button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="px-4 pt-3 space-y-2" role="alert">
          {conflicts.map((c) => (
            <p key={c.id} className={`rounded-xl px-3 py-2 text-xs ${c.severity === "warning" ? "bg-amber-50 text-amber-800" : "bg-navy-50 text-navy-800"}`}>
              {c.severity === "warning" ? "⚠ " : "ℹ "}{c.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-3 thin-scrollbar">
        {days.map((day) => (
          <div key={day.day} className="border border-ink-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-ink-900">Day {day.day}</h4>
              <span className="text-xs text-ink-500">{day.date || `Day ${day.day}`}</span>
            </div>
            {day.items.length === 0 ? (
              <div className="text-xs text-ink-500 text-center py-6 border-2 border-dashed border-ink-200 rounded-lg">
                Nothing planned yet — add items from the canvas.
              </div>
            ) : (
              <ul className="space-y-2">
                {day.items.map((item) => (
                  <li key={item.id} className="rounded-lg bg-ink-50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-ink-900 truncate">
                        <span className="text-xs text-ink-500 mr-1.5">{TYPE_LABEL[item.type] ?? item.type}</span>
                        {item.title}
                      </span>
                      <button
                        onClick={() => trip && removeItemFromTrip(trip.id, item.id)}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${item.title}`}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="text-[11px] text-ink-500" htmlFor={`move-${item.id}`}>Move to</label>
                      <select
                        id={`move-${item.id}`}
                        defaultValue=""
                        onChange={(e) => {
                          const toDay = parseInt(e.target.value, 10);
                          if (!trip || !toDay) return;
                          updateTripItem(trip.id, item.id, { details: { ...item.details, Day: `Day ${toDay}` } });
                          e.target.value = "";
                        }}
                        className={cn("rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs min-h-[44px]")}
                      >
                        <option value="">Day…</option>
                        {days.map((d) => (
                          <option key={d.day} value={d.day} disabled={d.day === day.day}>
                            Day {d.day}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100 p-4">
        <button onClick={addDay} className="btn-ghost w-full min-h-[48px] justify-center text-sm">
          + Add Day
        </button>
      </div>
    </div>
  );
}
