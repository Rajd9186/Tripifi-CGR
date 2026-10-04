"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RouteVisualization } from "@/components/graphics/RouteVisualization";

const CATEGORIES = [
  { label: "Flights", value: 14800, color: "bg-saffron-500" },
  { label: "Hotels", value: 18500, color: "bg-navy-900" },
  { label: "Private Cabs", value: 9200, color: "bg-teal-500" },
  { label: "Activities", value: 3400, color: "bg-amber-500" },
  { label: "Food", value: 2500, color: "bg-leaf-600" },
  { label: "Taxes", value: 2350, color: "bg-ink-300" },
];

export default function MapBudgetPanel() {
  const [budget] = useState({
    flights: 14800,
    hotels: 18500,
    cabs: 9200,
    activities: 3400,
    food: 2500,
    taxes: 2350,
    other: 0,
  });

  const total = Object.values(budget).reduce((sum, val) => sum + val, 0);
  const max = Math.max(...CATEGORIES.map((c) => c.value), 1);

  return (
    <div className="card flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-5">
        <h3 className="text-base font-semibold text-ink-900">Map & Budget</h3>
        <p className="text-xs text-ink-600">Route overview & cost breakdown</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative border-b border-ink-100 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative">
            <p className="micro-meta mb-3 text-[10px] text-white/50">LIVE ROUTE · SIMULATED MAP</p>
            <RouteVisualization from="Kolkata" to="Gangtok" meta="672 KM · 2H 05M" variant="dark" />
            <div className="mt-3 flex items-center gap-2 text-[11px] text-white/60">
              <span className="inline-flex h-2 w-2 rounded-full bg-saffron-400" />
              Origin
              <span className="inline-flex h-2 w-2 rounded-full bg-teal-400" />
              Destination
              <span className="ml-auto font-mono">3 STOPS</span>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 thin-scrollbar">
          <div className="mb-1 flex items-baseline justify-between">
            <h4 className="text-sm font-semibold text-ink-900">Live Budget</h4>
            <span className="font-mono text-[11px] text-ink-400">₹{(total / 2).toLocaleString("en-IN")} / TRAVELLER</span>
          </div>

          <div className="mb-4 mt-3">
            <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-ink-100" role="img" aria-label={`Budget breakdown, total ₹${total.toLocaleString("en-IN")}`}>
              {CATEGORIES.map((c) => (
                <span
                  key={c.label}
                  className={cn("h-full rounded-full transition-all duration-500", c.color)}
                  style={{ width: `${(c.value / total) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-500">₹48,500 trip budget</span>
              <span className="text-xs font-semibold text-leaf-700">₹2,750 remaining</span>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-ink-600">
                    <span className={cn("h-2 w-2 rounded-full", c.color)} aria-hidden="true" />
                    {c.label}
                  </span>
                  <span className="font-medium tabular-nums text-ink-900">
                    ₹{c.value.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", c.color)}
                    style={{ width: `${(c.value / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="font-semibold text-ink-900">Total</span>
              <span className="text-lg font-semibold tabular-nums text-ink-900">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-xs text-ink-500">
              Per traveller: ₹{Math.round(total / 2).toLocaleString("en-IN")} · Sample pricing
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-ink-100 p-4">
          <Link href="/checkout" className="btn-primary w-full min-h-[52px] justify-center text-sm">
            Proceed to Checkout
          </Link>
          <button className="btn-ghost w-full min-h-[48px] justify-center text-sm">
            Surprise Me
          </button>
        </div>
      </div>
    </div>
  );
}
