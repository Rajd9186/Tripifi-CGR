"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RouteVisualization } from "@/components/graphics/RouteVisualization";
import { useApp } from "@/lib/store";
import { calculateBudget, suggestOptimizations } from "@/lib/budget";
import { formatINR } from "@/lib/utils";

const COLORS = [
  { key: "flights", label: "Flights", color: "bg-saffron-500" },
  { key: "trains", label: "Trains", color: "bg-amber-500" },
  { key: "hotels", label: "Hotels", color: "bg-navy-900" },
  { key: "cabs", label: "Private Cabs", color: "bg-teal-500" },
  { key: "activities", label: "Activities", color: "bg-leaf-600" },
  { key: "taxes", label: "Taxes", color: "bg-ink-300" },
] as const;

export default function MapBudgetPanel() {
  const { currentTrip, ensureDraftTrip, updateTrip } = useApp();
  const [budgetInput, setBudgetInput] = useState("");

  const trip = currentTrip;
  const items = trip?.items ?? [];
  const travellers = trip?.travellers ?? 2;
  const breakdown = useMemo(() => calculateBudget(items, travellers), [items, travellers]);
  const max = Math.max(breakdown.flights, breakdown.trains, breakdown.hotels, breakdown.cabs, breakdown.activities, 1);
  const budget = trip?.budget;
  const remaining = budget !== undefined ? budget - breakdown.total : undefined;
  const suggestions = useMemo(
    () => (budget !== undefined ? suggestOptimizations(breakdown, budget, items) : []),
    [budget, breakdown, items]
  );

  const origin = trip?.origin || "Kolkata";
  const dests = trip?.destinations ?? [];
  const routeTo = dests[0] ?? "Gangtok";

  const saveBudget = () => {
    const t = trip ?? ensureDraftTrip({});
    const v = parseInt(budgetInput.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(v) || v <= 0) return;
    updateTrip(t.id, { budget: v });
    setBudgetInput("");
  };

  return (
    <div className="card flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-5">
        <h3 className="text-base font-semibold text-ink-900">Map & Budget</h3>
        <p className="text-xs text-ink-600">{trip ? `${trip.name} · live from your selections` : "Route overview & cost breakdown"}</p>
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
            <RouteVisualization from={origin} to={routeTo} meta={dests.length > 1 ? `${dests.length} STOPS` : undefined} variant="dark" />
            <div className="mt-3 flex items-center gap-2 text-[11px] text-white/60">
              <span className="inline-flex h-2 w-2 rounded-full bg-saffron-400" />
              Origin
              <span className="inline-flex h-2 w-2 rounded-full bg-teal-400" />
              Destination
              {dests.length > 0 && <span className="ml-auto font-mono">{dests.length} STOP{dests.length === 1 ? "" : "S"}</span>}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 thin-scrollbar">
          <div className="mb-1 flex items-baseline justify-between">
            <h4 className="text-sm font-semibold text-ink-900">Live Budget</h4>
            <span className="font-mono text-[11px] text-ink-400">{formatINR(breakdown.perTraveller)} / TRAVELLER</span>
          </div>

          <div className="mb-4 mt-3">
            <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-ink-100" role="img" aria-label={`Budget breakdown, total ${formatINR(breakdown.total)}`}>
              {COLORS.map((c) => {
                const v = breakdown[c.key];
                if (v <= 0 || breakdown.total <= 0) return null;
                return (
                  <span key={c.key} className={cn("h-full rounded-full transition-all duration-500", c.color)} style={{ width: `${(v / breakdown.total) * 100}%` }} />
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between">
              {budget !== undefined ? (
                <>
                  <span className="text-xs text-ink-500">{formatINR(budget)} trip budget</span>
                  <span className={`text-xs font-semibold ${remaining !== undefined && remaining >= 0 ? "text-leaf-700" : "text-red-600"}`}>
                    {remaining !== undefined && remaining >= 0 ? `${formatINR(remaining)} remaining` : `${formatINR(Math.abs(remaining ?? 0))} over budget`}
                  </span>
                </>
              ) : (
                <span className="text-xs text-ink-500">Set a budget to track remaining spend</span>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="My budget (₹)"
                inputMode="numeric"
                className="field min-h-[48px] flex-1"
                aria-label="Set trip budget in rupees"
              />
              <button onClick={saveBudget} className="btn-ghost min-h-[48px] text-sm">
                Set
              </button>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            {COLORS.map((c) => {
              const v = breakdown[c.key];
              if (v <= 0) return null;
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-ink-600">
                      <span className={cn("h-2 w-2 rounded-full", c.color)} aria-hidden="true" />
                      {c.label}
                    </span>
                    <span className="font-medium tabular-nums text-ink-900">{formatINR(v)}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink-100">
                    <div className={cn("h-full rounded-full transition-all duration-500", c.color)} style={{ width: `${(v / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {breakdown.count === 0 && (
              <p className="text-xs text-ink-500">No selections yet — budget updates as you add flights, stays, cabs and activities.</p>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="font-semibold text-ink-900">Total</span>
              <span className="text-lg font-semibold tabular-nums text-ink-900">{formatINR(breakdown.total)}</span>
            </div>
            <p className="text-xs text-ink-500">Per traveller: {formatINR(breakdown.perTraveller)} · Sample pricing</p>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">Over budget — suggestions (nothing changes automatically):</p>
              <ul className="mt-2 space-y-2">
                {suggestions.map((s) => (
                  <li key={s.id} className="text-xs text-amber-900">
                    <span className="font-medium">{s.title}</span> — save ~{formatINR(s.estimatedSavings)}. <span className="text-amber-700">{s.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-ink-100 p-4">
          <Link href="/checkout" className="btn-primary w-full min-h-[52px] justify-center text-sm">
            Proceed to Checkout
          </Link>
          <Link href="/assistance?type=CUSTOM_TRIP" className="btn-ghost w-full min-h-[48px] justify-center text-sm">
            Request Complete Trip Assistance
          </Link>
        </div>
      </div>
    </div>
  );
}
