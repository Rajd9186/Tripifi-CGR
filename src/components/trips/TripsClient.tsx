"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

function statusBadge(status: string) {
  if (status === "draft") return <Badge variant="default">Planning</Badge>;
  if (status === "confirmed") return <Badge variant="success">Confirmed</Badge>;
  if (status === "completed") return <Badge variant="info">Completed</Badge>;
  return <Badge variant="default">{status}</Badge>;
}

export default function TripsClient() {
  const { trips, bookings, deleteTrip } = useApp();

  const upcoming = trips.filter((t) => t.status === "draft" || t.status === "confirmed");
  const past = [...trips.filter((t) => t.status === "completed"), ...bookings.filter((b) => b.status === "completed").map((b) => ({
    id: b.id,
    bookingRef: b.id,
    name: b.title,
    status: "completed" as const,
    startDate: b.date,
    endDate: b.date,
    travellers: 1,
    items: [],
    totalAmount: b.amount,
    destinations: [] as string[],
    origin: b.route,
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
  }))];

  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">JOURNEYS · TRIPIFI CGR</p>
          <h1 className="fluid-section mt-1 font-display font-semibold text-white">My Trips</h1>
          <p className="mt-2 text-[15px] text-white/80">Complete journeys — not isolated bookings.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-8xl mx-auto space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Upcoming & Planning</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                title="No journeys yet."
                description="Let's build your first one — search, select, and add everything to a single trip."
                actionLabel="Plan a Trip"
                actionHref="/plan"
              />
            ) : (
              <div className="space-y-4">
                {upcoming.map((trip) => (
                  <Card key={trip.id} padding="md">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-ink-900">{trip.name}</h3>
                          {statusBadge(trip.status)}
                        </div>
                        <p className="text-sm text-ink-600">
                          {trip.origin ?? "—"}{trip.destinations.length > 0 ? ` → ${trip.destinations.join(" → ")}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-ink-600">
                          <span>{trip.startDate || "Dates flexible"}{trip.endDate ? ` → ${trip.endDate}` : ""}</span>
                          <span>{trip.travellers} traveller{trip.travellers === 1 ? "" : "s"}</span>
                          <span>{trip.items.length} item{trip.items.length === 1 ? "" : "s"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col lg:items-end gap-3">
                        <div className="text-xl font-semibold text-ink-900">{formatINR(trip.totalAmount)}</div>
                        <div className="flex gap-2">
                          <Link href={`/trips/${trip.id}`} className="btn-ghost min-h-[44px] text-sm">View Journey</Link>
                          <Link href="/plan" className="btn-primary min-h-[44px] text-sm">Continue Planning</Link>
                          <button onClick={() => deleteTrip(trip.id)} className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm text-ink-400 hover:text-red-600 hover:bg-red-50" aria-label={`Delete ${trip.name}`}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Past</h2>
              <div className="space-y-4">
                {past.map((trip) => (
                  <Card key={trip.id} padding="md">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-ink-900">{trip.name}</h3>
                          {statusBadge(trip.status)}
                        </div>
                        <p className="text-sm text-ink-600">{trip.startDate}</p>
                      </div>
                      <div className="text-xl font-semibold text-ink-900">{formatINR(trip.totalAmount)}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
