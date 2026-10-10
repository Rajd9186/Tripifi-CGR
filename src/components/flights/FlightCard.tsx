"use client";

import Badge from "@/components/ui/Badge";
import type { FlightOffer } from "@/lib/api/types";
import { PriceText } from "@/components/ui/PriceText";
import { formatINR } from "@/lib/utils";

/** Flight offer card. Renders live offers; demo badges appear only if an offer is demo-flagged. */
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  price: number;
  classType: string;
  baggage: string;
  meals: string;
  refundable: boolean;
}

interface FlightCardProps {
  flight: FlightOffer;
  selected?: boolean;
  onSelect?: (flight: FlightOffer) => void;
  onAddToTrip?: (flight: FlightOffer) => void;
}

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function FlightCard({ flight, selected, onSelect, onAddToTrip }: FlightCardProps) {
  return (
    <div className={`card p-4 sm:p-6 transition-all ${selected ? "ring-2 ring-saffron-500" : ""}`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded bg-navy-50 flex items-center justify-center text-text font-semibold text-xs">
              {flight.airline.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-ink-900">{flight.airline}</div>
              <div className="text-xs text-ink-500">{flight.flight_number}</div>
            </div>
            {flight.is_demo && (
              <span className="demo-badge">Demo availability</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-semibold text-ink-900">
                {flight.departure}
              </div>
              <div className="text-sm text-ink-600">{flight.origin}</div>
            </div>

            <div className="flex flex-col items-center flex-1 px-4">
              <div className="text-sm text-ink-600">{fmtDuration(flight.duration_minutes)}</div>
              <div className="relative w-full my-2">
                <div className="h-0.5 bg-ink-200"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-ink-400"></div>
              </div>
              <div className="text-sm text-ink-600">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold text-ink-900">
                {flight.arrival}
              </div>
              <div className="text-sm text-ink-600">{flight.destination}</div>
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-ink-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col lg:items-end gap-3">
          <div className="flex items-center justify-between lg:flex-col lg:items-end w-full lg:w-auto">
            <div>
              <div className="text-xs text-ink-500">{flight.is_demo ? "Sample fare" : "Fare"}</div>
              <div className="text-3xl font-semibold text-ink-900">
                <PriceText value={flight.fare} />
              </div>
              <div className="text-xs text-ink-500">per traveller</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {flight.refundable && <Badge variant="success">Refundable</Badge>}
            <Badge variant="default">{flight.baggage_kg} kg check-in</Badge>
            <Badge variant="default">{flight.seat_available ? "Seats available" : "Check seats"}</Badge>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
            <button
              onClick={() => onSelect?.(flight)}
              className="btn-primary min-h-[44px] flex-1 justify-center lg:min-w-[180px]"
              aria-pressed={selected}
            >
              {selected ? "Selected ✓" : "Select"}
            </button>
            <button
              onClick={() => onAddToTrip?.(flight)}
              className="btn-ghost min-h-[44px] flex-1 justify-center text-sm lg:min-w-[180px]"
            >
              Add to Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
