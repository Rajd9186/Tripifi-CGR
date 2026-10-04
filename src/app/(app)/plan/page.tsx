import type { Metadata } from "next";
import ItineraryPanel from "@/components/trip-builder/ItineraryPanel";
import TripCanvas from "@/components/trip-builder/TripCanvas";
import MapBudgetPanel from "@/components/trip-builder/MapBudgetPanel";

export const metadata: Metadata = {
  title: "Trip Builder",
  description: "Build your complete journey with Tripifi CGR. Customize your itinerary, add transport, hotels and activities.",
};

export default function PlanPage() {
  return (
    <div className="pb-4 pt-2 px-2 sm:px-4 lg:px-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-4">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Trip Builder
          </h1>
          <p className="text-base text-ink-600 mt-1">
            Build your complete journey. Your trip. Your way.
          </p>
        </div>

        <div className="hidden lg:grid lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          <div className="lg:col-span-3">
            <ItineraryPanel />
          </div>
          <div className="lg:col-span-6">
            <TripCanvas />
          </div>
          <div className="lg:col-span-3">
            <MapBudgetPanel />
          </div>
        </div>

        <div className="lg:hidden space-y-4">
          <div className="flex gap-2 overflow-auto pb-2 no-scrollbar">
            <button className="chip chip-active flex-shrink-0">Itinerary</button>
            <button className="chip flex-shrink-0">Canvas</button>
            <button className="chip flex-shrink-0">Map & Budget</button>
          </div>
          <div className="h-[70vh]">
            <TripCanvas />
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-ink-600">Total</span>
                <div className="text-xl font-semibold text-ink-900">₹0</div>
              </div>
              <button className="btn-primary">Continue</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
