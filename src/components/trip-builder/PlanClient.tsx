"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ItineraryPanel from "@/components/trip-builder/ItineraryPanel";
import TripCanvas from "@/components/trip-builder/TripCanvas";
import MapBudgetPanel from "@/components/trip-builder/MapBudgetPanel";
import { useApp } from "@/lib/store";
import { calculateBudget } from "@/lib/budget";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MobileTab = "itinerary" | "canvas" | "budget";

const mobileTabs: Array<{ id: MobileTab; label: string }> = [
  { id: "itinerary", label: "Itinerary" },
  { id: "canvas", label: "Canvas" },
  { id: "budget", label: "Budget" },
];

export default function PlanClient() {
  const [activeTab, setActiveTab] = useState<MobileTab>("itinerary");
  const { currentTrip } = useApp();
  const travellers = currentTrip?.travellers ?? 2;
  const breakdown = useMemo(
    () => calculateBudget(currentTrip?.items ?? [], travellers),
    [currentTrip?.items, travellers]
  );

  return (
    <div className="px-2 pb-4 pt-2 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4">
          <p className="micro-meta text-[11px] text-ink-400">TRIP BUILDER · DRAFT</p>
          <h1 className="fluid-section mt-1 font-display font-semibold text-ink-900">
            Trip Builder
          </h1>
          <p className="mt-1 text-[15px] text-ink-600">
            Build your complete journey. Your trip. Your way.
          </p>
        </div>

        <div className="hidden h-[calc(100vh-180px)] gap-4 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-3 min-h-0">
            <ItineraryPanel />
          </div>
          <div className="lg:col-span-6 min-h-0">
            <TripCanvas />
          </div>
          <div className="lg:col-span-3 min-h-0">
            <MapBudgetPanel />
          </div>
        </div>

        <div className="space-y-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Trip builder views">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex min-h-[44px] flex-shrink-0 items-center rounded-full border px-5 text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "border-saffron-500 bg-saffron-500 text-[#10161C]"
                    : "border-ink-200 bg-surface text-ink-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[68dvh]">
            {activeTab === "itinerary" && (
              <div className="h-[68dvh]">
                <ItineraryPanel />
              </div>
            )}
            {activeTab === "canvas" && (
              <div className="h-[68dvh]">
                <TripCanvas />
              </div>
            )}
            {activeTab === "budget" && (
              <div className="min-h-[68dvh]">
                <MapBudgetPanel />
              </div>
            )}
          </div>

          <div className="card sticky bottom-[96px] space-y-3 p-4 safe-bottom">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-ink-500">TOTAL · {travellers} TRAVELLER{travellers === 1 ? "" : "S"} · ESTIMATED</span>
                <div className="text-xl font-semibold tabular-nums text-ink-900">{formatINR(breakdown.total)}</div>
              </div>
              <Link href="/checkout" className="btn-primary inline-flex min-h-[52px] flex-1 justify-center sm:flex-none sm:px-8">
                Continue
              </Link>
            </div>
            <Link
              href="/assistance?type=CUSTOM_TRIP"
              className="btn-teal inline-flex min-h-[48px] w-full justify-center text-sm"
            >
              Request Complete Trip Assistance
            </Link>
            <p className="text-center text-[11px] text-ink-400">Hotel & cab availability requires confirmation — one consolidated enquiry.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
