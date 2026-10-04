"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Package } from "@/components/packages/PackageCard";
import { useApp } from "@/lib/store";
import { formatINR } from "@/lib/utils";

const HOTEL_TIERS = [
  { id: "standard", label: "Standard (3★)", delta: 0 },
  { id: "comfort", label: "Comfort (4★)", delta: 8000 },
  { id: "premium", label: "Premium (5★ / Heritage)", delta: 18000 },
];

const VEHICLES = [
  { id: "shared", label: "Shared transfers", delta: 0 },
  { id: "private-sedan", label: "Private Sedan", delta: 4000 },
  { id: "private-suv", label: "Private SUV", delta: 9000 },
];

const EXTRA_ACTIVITIES = [
  { id: "photography", label: "Photography walk", price: 1500 },
  { id: "cuisine", label: "Local cuisine trail", price: 2000 },
  { id: "adventure", label: "Adventure add-on", price: 3500 },
];

function baseNights(duration: string): number {
  const m = /(\d+)\s*Nights?/i.exec(duration);
  return m ? parseInt(m[1], 10) : 5;
}

export default function PackageCustomize({ pkg }: { pkg: Package }) {
  const { ensureDraftTrip, addItemToTrip, toast } = useApp();
  const nights0 = baseNights(pkg.duration);
  const [hotel, setHotel] = useState("standard");
  const [vehicle, setVehicle] = useState("shared");
  const [extraNights, setExtraNights] = useState(0);
  const [activities, setActivities] = useState<string[]>([]);

  const deltas = useMemo(() => {
    const h = HOTEL_TIERS.find((t) => t.id === hotel)?.delta ?? 0;
    const v = VEHICLES.find((t) => t.id === vehicle)?.delta ?? 0;
    const n = extraNights * 4500;
    const a = EXTRA_ACTIVITIES.filter((x) => activities.includes(x.id)).reduce((s, x) => s + x.price, 0);
    return { hotel: h, vehicle: v, nights: n, activities: a, total: h + v + n + a };
  }, [hotel, vehicle, extraNights, activities]);

  const total = pkg.price + deltas.total;

  const toggleActivity = (id: string) =>
    setActivities((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const summary = [
    `Hotel: ${HOTEL_TIERS.find((t) => t.id === hotel)?.label}`,
    `Transport: ${VEHICLES.find((t) => t.id === vehicle)?.label}`,
    extraNights > 0 ? `+${extraNights} night${extraNights > 1 ? "s" : ""}` : null,
    ...EXTRA_ACTIVITIES.filter((x) => activities.includes(x.id)).map((x) => x.label),
  ].filter(Boolean) as string[];

  const addToTrip = () => {
    const trip = ensureDraftTrip({ name: pkg.title });
    addItemToTrip(trip.id, {
      type: "package",
      title: `${pkg.title} · customized`,
      route: pkg.route,
      date: "",
      amount: total,
      status: "upcoming",
      details: {
        Duration: `${nights0 + extraNights} Nights`,
        Customizations: summary.join("; "),
        Base: formatINR(pkg.price),
      },
    });
    toast(`Package added to ${trip.name}`, "success");
  };

  return (
    <div className="space-y-6">
      <Card title="Customize This Package">
        <div className="space-y-4">
          <div>
            <label className="input-label" htmlFor="pkg-hotel">Hotel tier</label>
            <select id="pkg-hotel" value={hotel} onChange={(e) => setHotel(e.target.value)} className="field min-h-[52px]">
              {HOTEL_TIERS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}{t.delta > 0 ? ` (+${formatINR(t.delta)})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="pkg-vehicle">Transport</label>
            <select id="pkg-vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="field min-h-[52px]">
              {VEHICLES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}{t.delta > 0 ? ` (+${formatINR(t.delta)})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="input-label" id="pkg-nights-label">Extra nights</span>
            <div className="flex items-center gap-3" role="group" aria-labelledby="pkg-nights-label">
              <button onClick={() => setExtraNights((n) => Math.max(0, n - 1))} className="chip min-h-[44px]" aria-label="Remove night">-</button>
              <span className="text-sm font-medium text-ink-900 min-w-[72px] text-center">+{extraNights}</span>
              <button onClick={() => setExtraNights((n) => Math.min(7, n + 1))} className="chip min-h-[44px]" aria-label="Add night">+</button>
            </div>
          </div>
          <fieldset>
            <legend className="input-label">Extra activities</legend>
            <div className="space-y-2">
              {EXTRA_ACTIVITIES.map((a) => (
                <label key={a.id} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-ink-200 px-3">
                  <input
                    type="checkbox"
                    checked={activities.includes(a.id)}
                    onChange={() => toggleActivity(a.id)}
                    className="h-5 w-5 accent-saffron-600"
                  />
                  <span className="flex-1 text-sm text-ink-800">{a.label}</span>
                  <span className="text-sm font-medium text-ink-900">+{formatINR(a.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Card>

      <Card title="Price Summary">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-ink-600">Original package</dt><dd className="tabular-nums">{formatINR(pkg.price)}</dd></div>
          {deltas.hotel > 0 && <div className="flex justify-between"><dt className="text-ink-600">Hotel upgrade</dt><dd className="tabular-nums">+{formatINR(deltas.hotel)}</dd></div>}
          {deltas.vehicle > 0 && <div className="flex justify-between"><dt className="text-ink-600">Transport upgrade</dt><dd className="tabular-nums">+{formatINR(deltas.vehicle)}</dd></div>}
          {deltas.nights > 0 && <div className="flex justify-between"><dt className="text-ink-600">Extra nights</dt><dd className="tabular-nums">+{formatINR(deltas.nights)}</dd></div>}
          {deltas.activities > 0 && <div className="flex justify-between"><dt className="text-ink-600">Activities</dt><dd className="tabular-nums">+{formatINR(deltas.activities)}</dd></div>}
          <div className="flex justify-between border-t border-ink-100 pt-2 font-semibold"><dt>Updated total</dt><dd className="tabular-nums">{formatINR(total)}</dd></div>
        </dl>
        <div className="mt-4 flex flex-col gap-2">
          <button onClick={addToTrip} className="btn-primary min-h-[52px] w-full justify-center">Add to Trip</button>
          <Link href="/plan" className="btn-ghost min-h-[48px] w-full justify-center">Customize in Trip Builder</Link>
          <Link href={`/assistance?type=PACKAGE&destination=${encodeURIComponent(pkg.title)}`} className="btn-teal min-h-[48px] w-full justify-center text-sm">Request Booking</Link>
        </div>
      </Card>
    </div>
  );
}
