"use client";

import Badge from "@/components/ui/Badge";
import type { TrainOffer } from "@/lib/api/types";
import { PriceText } from "@/components/ui/PriceText";
import { formatINR } from "@/lib/utils";

/** Legacy mock shape (see src/data/mockTrains.ts). Prefer TrainOffer for new code. */
export interface Train {
  id: string;
  number: string;
  name: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  days: string[];
  classes: Array<{
    type: string;
    availability: string;
    price: number;
  }>;
}

interface TrainCardProps {
  train: TrainOffer;
  selected?: boolean;
  selectedClass?: string;
  onSelect?: (train: TrainOffer, travelClass: string) => void;
  onAddToTrip?: (train: TrainOffer, travelClass: string) => void;
}

export default function TrainCard({ train, selected, selectedClass, onSelect, onAddToTrip }: TrainCardProps) {
  return (
    <div className={`card p-4 sm:p-6 transition-all ${selected ? "ring-2 ring-saffron-500" : ""}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-ink-900">
              {train.train_number} • {train.train_name}
            </div>
            <div className="text-sm text-ink-600 mt-1">
              {train.origin} → {train.destination}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {train.is_demo && <span className="demo-badge">Demo availability</span>}
            <div className="flex flex-wrap gap-1" aria-label="Running days">
              {train.running_days.map((day) => (
                <span
                  key={day}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-ink-200 bg-surface text-[10px] font-medium text-ink-700"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-semibold text-ink-900">
              {train.departure}
            </div>
            <div className="text-sm text-ink-600">{train.origin}</div>
          </div>

          <div className="flex flex-col items-center flex-1 px-4">
            <div className="text-sm text-ink-600">
              {Math.floor(train.duration_minutes / 60)}h {train.duration_minutes % 60}m
            </div>
            <div className="relative w-full my-2">
              <div className="h-0.5 bg-ink-200"></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-ink-900">
              {train.arrival}
            </div>
            <div className="text-sm text-ink-600">{train.destination}</div>
          </div>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="border border-ink-100 rounded-lg p-2 text-center">
              <div className="text-xs font-medium text-ink-900">{train.travel_class}</div>
              <div className="text-xs text-ink-600 mt-1">{train.availability}</div>
              <div className="text-sm font-semibold text-ink-900 mt-1">
                <PriceText value={train.fare} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => onSelect?.(train, train.travel_class)}
            className="btn-primary min-h-[44px] flex-1 justify-center"
            aria-pressed={selected && selectedClass === train.travel_class}
          >
            {selected && selectedClass === train.travel_class ? "Selected ✓" : `Select · ${train.travel_class}`}
          </button>
          <button
            onClick={() => onAddToTrip?.(train, train.travel_class)}
            className="btn-ghost min-h-[44px] flex-1 justify-center text-sm"
          >
            Add to Trip
          </button>
        </div>
      </div>
    </div>
  );
}
