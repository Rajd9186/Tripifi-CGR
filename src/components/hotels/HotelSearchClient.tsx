"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { validateHotelSearch, type FieldErrors } from "@/lib/validation";
import { useApp } from "@/lib/store";
import { todayISO, addDaysISO } from "@/lib/utils";

export default function HotelSearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { updateSearchState } = useApp();
  const today = todayISO();
  const [destination, setDestination] = useState(params.get("destination") ?? "");
  const [checkin, setCheckin] = useState(params.get("checkin") ?? today);
  const [checkout, setCheckout] = useState(params.get("checkout") ?? addDaysISO(today, 3));
  const [guests, setGuests] = useState("2 Guests, 1 Room");
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = () => {
    const errs = validateHotelSearch({ destination, checkin, checkout });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateSearchState({ hotels: { destination, checkin, checkout, guests, rooms: guests } });
    router.push(`/hotels/results?${new URLSearchParams({ destination, checkin, checkout, guests }).toString()}`);
  };

  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">STAYS · TRIPIFI CGR</p>
          <h1 className="fluid-section mt-1 font-display font-semibold tracking-tight text-white">Search Hotels</h1>
          <p className="mt-3 text-[15px] text-white/80">Comfortable stays for every journey — clearly marked sample inventory.</p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <Card padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <label className="input-label" htmlFor="h-dest">Destination</label>
                <input id="h-dest" className="field min-h-[52px]" placeholder="Gangtok" value={destination} onChange={(e) => setDestination(e.target.value)} aria-invalid={Boolean(errors.destination)} />
                {errors.destination && <p role="alert" className="mt-1 text-xs text-red-600">{errors.destination}</p>}
              </div>
              <div>
                <label className="input-label" htmlFor="h-in">Check-in</label>
                <input id="h-in" type="date" className="field min-h-[52px]" value={checkin} min={today} onChange={(e) => setCheckin(e.target.value)} aria-invalid={Boolean(errors.checkin)} />
                {errors.checkin && <p role="alert" className="mt-1 text-xs text-red-600">{errors.checkin}</p>}
              </div>
              <div>
                <label className="input-label" htmlFor="h-out">Check-out</label>
                <input id="h-out" type="date" className="field min-h-[52px]" value={checkout} min={checkin} onChange={(e) => setCheckout(e.target.value)} aria-invalid={Boolean(errors.checkout)} />
                {errors.checkout && <p role="alert" className="mt-1 text-xs text-red-600">{errors.checkout}</p>}
              </div>
              <div>
                <label className="input-label" htmlFor="h-guests">Guests</label>
                <select id="h-guests" className="field min-h-[52px]" value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option>1 Guest, 1 Room</option>
                  <option>2 Guests, 1 Room</option>
                  <option>3 Guests, 1 Room</option>
                  <option>4 Guests, 2 Rooms</option>
                </select>
              </div>
              <div className="flex items-end md:col-span-2 lg:col-span-5">
                <button onClick={submit} className="btn-primary min-h-[52px] w-full justify-center md:w-auto">Search Hotels</button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
