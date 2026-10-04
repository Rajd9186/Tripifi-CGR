"use client";

import { useState } from "react";

export default function ItineraryPanel() {
  const [days, setDays] = useState<number>(3);

  return (
    <div className="card h-full flex flex-col">
      <div className="border-b border-ink-100 px-4 sm:px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Itinerary</h3>
          <p className="text-xs text-ink-600">Plan your day-by-day journey</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="chip">-</button>
          <span className="text-sm font-medium text-ink-900">{days} Days</span>
          <button className="chip">+</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3 thin-scrollbar">
        {[...Array(days)].map((_, i) => (
          <div key={i} className="border border-ink-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-ink-900">Day {i + 1}</h4>
              <span className="text-xs text-ink-500">Day {i + 1}</span>
            </div>
            <div className="text-xs text-ink-500 text-center py-6 border-2 border-dashed border-ink-200 rounded-lg">
              Drop activities, hotels, or transport here
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100 p-4">
        <button className="btn-ghost w-full justify-center text-sm">
          + Add Day
        </button>
      </div>
    </div>
  );
}
