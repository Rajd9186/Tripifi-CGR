"use client";

import Badge from "@/components/ui/Badge";
import type { CabOffer } from "@/lib/api/types";
import { formatINR } from "@/lib/utils";
import { calculateCabFare, type CabTripType, type CabVehicle } from "@/lib/providers/cabPricing";

/** Legacy mock shape (see src/data/mockCabs.ts). Prefer CabOffer for new code. */
export interface Cab {
  id: string;
  type: string;
  category: "sedan" | "suv" | "premium" | "luxury";
  name: string;
  capacity: number;
  price: number;
  extraKm: number;
  includedKm: number;
  driverRating: number;
  cancellationPolicy: string;
  image: string;
  features: string[];
}

interface CabCardProps {
  cab: CabOffer;
  distanceKm?: number;
  tripType?: CabTripType;
  selected?: boolean;
  onSelect?: (cab: CabOffer) => void;
  onAddToTrip?: (cab: CabOffer) => void;
}

function toVehicle(type: string): CabVehicle {
  const t = type.toLowerCase();
  if (t.includes("luxury")) return "luxury";
  if (t.includes("premium")) return "premium";
  if (t.includes("suv")) return "suv";
  return "sedan";
}

export default function CabCard({ cab, distanceKm = 120, tripType = "oneway", selected, onSelect, onAddToTrip }: CabCardProps) {
  const fare = calculateCabFare(distanceKm, toVehicle(cab.vehicle_type), tripType);

  return (
    <div className={`card overflow-hidden transition-all ${selected ? "ring-2 ring-saffron-500" : ""}`}>
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-ink-900">{cab.vehicle_model}</h3>
              <p className="text-sm text-ink-600 mt-1">
                {cab.vehicle_type} • Up to {cab.capacity} passengers
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-ink-500">Estimated fare</div>
              <div className="text-2xl font-semibold text-ink-900">
                {formatINR(fare.total)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default">{fare.includedKm} km included</Badge>
            <Badge variant="default">₹{fare.extraKm > 0 ? Math.round(fare.extraKmCharge / Math.max(1, fare.extraKm)) : 12}/km extra</Badge>
            {cab.driver_rating != null && cab.driver_rating > 4.5 && <Badge variant="success">Highly rated</Badge>}
            {cab.is_demo && <span className="demo-badge">Estimated fare</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
            <div className="rounded-lg bg-ink-50 px-2 py-1.5">
              <div className="text-ink-500">Base fare</div>
              <div className="font-semibold text-ink-900">{formatINR(fare.baseFare)}</div>
            </div>
            <div className="rounded-lg bg-ink-50 px-2 py-1.5">
              <div className="text-ink-500">Extra km ({fare.extraKm})</div>
              <div className="font-semibold text-ink-900">{formatINR(fare.extraKmCharge)}</div>
            </div>
            <div className="rounded-lg bg-ink-50 px-2 py-1.5">
              <div className="text-ink-500">Tolls</div>
              <div className="font-semibold text-ink-900">{formatINR(fare.tollEstimate)}</div>
            </div>
            <div className="rounded-lg bg-ink-50 px-2 py-1.5">
              <div className="text-ink-500">Taxes</div>
              <div className="font-semibold text-ink-900">{formatINR(fare.taxes)}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-ink-100 pt-4">
            <div className="text-sm text-ink-600 flex-1">
              Driver rating{cab.driver_rating != null ? `: ${cab.driver_rating}/5` : " on request"} • {cab.cancellation_policy}
            </div>
            <button
              onClick={() => onSelect?.(cab)}
              className="btn-primary min-h-[44px] justify-center text-sm"
              aria-pressed={selected}
            >
              {selected ? "Selected ✓" : "Select"}
            </button>
            <button
              onClick={() => onAddToTrip?.(cab)}
              className="btn-ghost min-h-[44px] justify-center text-sm"
            >
              Add to Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

