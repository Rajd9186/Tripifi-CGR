"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { buildItinerary } from "@/lib/itinerary";
import { calculateBudget } from "@/lib/budget";
import { formatINR } from "@/lib/utils";
import { RouteVisualization } from "@/components/graphics/RouteVisualization";

const TYPE_ICON: Record<string, string> = {
  flight: "✈",
  train: "🚂",
  cab: "🚙",
  hotel: "🏨",
  package: "🎒",
  custom: "📍",
};

export default function TripDetailClient({ id }: { id: string }) {
  const { trips, setCurrentTrip, deleteTrip } = useApp();
  const trip = trips.find((t) => t.id === id);
  if (!trip) notFound();

  const days = buildItinerary(trip.items, trip.startDate, trip.endDate);
  const budget = calculateBudget(trip.items, trip.travellers);

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">JOURNEY · {trip.status.toUpperCase()}</p>
          <h1 className="fluid-section mt-1 font-display font-semibold text-white">{trip.name}</h1>
          <p className="mt-2 text-[15px] text-white/80">
            {trip.startDate || "Flexible dates"}{trip.endDate ? ` → ${trip.endDate}` : ""} · {trip.travellers} traveller{trip.travellers === 1 ? "" : "s"} · {formatINR(budget.total)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/plan" onClick={() => setCurrentTrip(trip)} className="inline-flex min-h-[44px] items-center rounded-xl bg-white/10 border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/20">
              Edit Trip
            </Link>
            <Link href={`/assistance?type=CUSTOM_TRIP`} className="inline-flex min-h-[44px] items-center rounded-xl bg-saffron-500 px-4 text-sm font-semibold text-[#10161C] hover:bg-saffron-600">
              Request Booking
            </Link>
            <button onClick={() => { deleteTrip(trip.id); window.location.href = "/trips"; }} className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm text-white/60 hover:text-white">
              Delete
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card padding="md">
              <h2 className="text-base font-semibold text-ink-900 mb-3">Route</h2>
              <RouteVisualization from={trip.origin || "Kolkata"} to={trip.destinations[0] ?? "Destination"} variant="light" />
              {trip.destinations.slice(1).map((d, i) => (
                <div key={d} className="mt-2">
                  <RouteVisualization from={trip.destinations[i] ?? trip.origin ?? ""} to={d} variant="light" />
                </div>
              ))}
            </Card>

            <Card padding="md">
              <h2 className="text-base font-semibold text-ink-900 mb-3">Timeline</h2>
              {days.map((day) => (
                <div key={day.day} className="relative pl-10 pb-6 last:pb-0">
                  <span className="timeline-dot">{day.day}</span>
                  <p className="text-sm font-medium text-ink-900">Day {day.day}{day.date ? ` · ${day.date}` : ""}</p>
                  {day.items.length === 0 ? (
                    <p className="text-xs text-ink-400 mt-1">Free day — add activities from the Trip Builder.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {day.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-ink-700"><span className="mr-1.5">{TYPE_ICON[item.type] ?? "•"}</span>{item.title}</span>
                          <span className="text-ink-500 tabular-nums">{formatINR(item.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </Card>
          </div>

          <div className="space-y-4">
            <Card padding="md">
              <h2 className="text-base font-semibold text-ink-900 mb-3">Budget</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-ink-600">Flights</span><span className="tabular-nums">{formatINR(budget.flights)}</span></div>
                <div className="flex justify-between"><span className="text-ink-600">Trains</span><span className="tabular-nums">{formatINR(budget.trains)}</span></div>
                <div className="flex justify-between"><span className="text-ink-600">Hotels</span><span className="tabular-nums">{formatINR(budget.hotels)}</span></div>
                <div className="flex justify-between"><span className="text-ink-600">Cabs</span><span className="tabular-nums">{formatINR(budget.cabs)}</span></div>
                <div className="flex justify-between"><span className="text-ink-600">Activities</span><span className="tabular-nums">{formatINR(budget.activities)}</span></div>
                <div className="flex justify-between"><span className="text-ink-600">Taxes</span><span className="tabular-nums">{formatINR(budget.taxes)}</span></div>
                <div className="flex justify-between border-t border-ink-100 pt-2 font-semibold"><span>Total</span><span className="tabular-nums">{formatINR(budget.total)}</span></div>
                <div className="flex justify-between text-ink-600"><span>Per traveller</span><span className="tabular-nums">{formatINR(budget.perTraveller)}</span></div>
              </div>
            </Card>

            <Card padding="md">
              <h2 className="text-base font-semibold text-ink-900 mb-2">Booking status</h2>
              <Badge variant={trip.status === "draft" ? "default" : "success"}>{trip.status === "draft" ? "Planning" : trip.status}</Badge>
              <p className="mt-2 text-xs text-ink-500">Live booking isn&apos;t available for these services yet — request assistance and our travel team will arrange it.</p>
              <Link href="/assistance?type=CUSTOM_TRIP" className="btn-primary mt-3 w-full min-h-[48px] justify-center text-sm">
                Request Booking Assistance
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
