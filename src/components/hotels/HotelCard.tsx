"use client";

import type { HotelOffer } from "@/lib/api/types";
import Badge from "@/components/ui/Badge";
import { PriceText } from "@/components/ui/PriceText";
import { formatINR } from "@/lib/utils";

interface HotelCardProps {
  hotel: HotelOffer;
  nights?: number;
  selected?: boolean;
  onSelect?: (hotel: HotelOffer) => void;
  onAddToTrip?: (hotel: HotelOffer) => void;
}

export default function HotelCard({ hotel, nights = 3, selected, onSelect, onAddToTrip }: HotelCardProps) {
  const total = hotel.total_price ?? (hotel.price_per_night != null ? hotel.price_per_night * nights : null);
  const details = [hotel.room_type, hotel.meal_plan].filter(Boolean).join(" · ");
  return (
    <div className={`card overflow-hidden transition-all ${selected ? "ring-2 ring-saffron-500" : ""}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-lg font-semibold text-ink-900">{hotel.name}</h3>
            <p className="text-sm text-ink-600 mt-0.5">{hotel.location} · {hotel.destination}</p>
          </div>
          {hotel.rating != null && (
            <div className="flex items-center gap-1 rounded-lg bg-saffron-50 px-2 py-1 text-sm font-semibold text-saffron-700">
              ★ {hotel.rating.toFixed(1)}
            </div>
          )}
        </div>

        {details ? <div className="text-sm text-ink-600">{details}</div> : null}

        <div className="flex flex-wrap gap-2 mt-3">
          {hotel.amenities.slice(0, 4).map((a) => (
            <Badge key={a} variant="default">{a}</Badge>
          ))}
          {hotel.cancellation_policy && <Badge variant="success">{hotel.cancellation_policy}</Badge>}
          {hotel.is_demo && <span className="demo-badge">Simulated inventory</span>}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3 border-t border-ink-100 pt-4">
          <div className="flex-1">
            <div className="text-xs text-ink-500">{hotel.is_demo ? "Sample price" : "Price per night"}</div>
            <div className="text-xl font-semibold text-ink-900">
              <PriceText value={hotel.price_per_night} /><span className="text-sm font-normal text-ink-500">/night</span>
            </div>
            <div className="text-sm text-ink-600">
              {total != null ? (
                <>{formatINR(total)} total for {nights} night{nights > 1 ? "s" : ""}</>
              ) : (
                <>Total price on request</>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button onClick={() => onSelect?.(hotel)} className="btn-primary min-h-[44px] flex-1 justify-center sm:min-w-[150px]" aria-pressed={selected}>
              {selected ? "Selected ✓" : "Select"}
            </button>
            <button onClick={() => onAddToTrip?.(hotel)} className="btn-ghost min-h-[44px] flex-1 justify-center text-sm sm:min-w-[150px]">
              Add to Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
