"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { formatINR } from "@/lib/utils";

export default function BookingClient({ id }: { id: string }) {
  const { bookings, trips } = useApp();
  const booking = bookings.find((b) => b.id === id);
  const trip = trips.find((t) => t.id === id);
  const found = booking ?? null;

  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">REFERENCE · {id}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            {found ? "Booking Details" : trip ? "Trip Details" : "Reference Not Found"}
          </h1>
          <p className="mt-2 text-base text-white/80">
            {found
              ? "Your booking record as stored in this prototype."
              : trip
                ? "Your saved journey."
                : "We couldn't find a booking or trip with this reference."}
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-3xl mx-auto space-y-6">
          {found ? (
            <>
              <Card padding="lg" className="text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-navy-50 flex items-center justify-center mb-4 text-navy-900 font-display text-xl font-semibold">
                  {found.title.charAt(0)}
                </div>
                <h2 className="text-2xl font-semibold text-ink-900 mb-2">{found.title}</h2>
                <p className="text-base text-ink-600 mb-4">
                  {found.route ?? ""} · {found.date}
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant={found.status === "cancelled" ? "danger" : found.status === "completed" ? "info" : "success"} size="md">
                    {found.status}
                  </Badge>
                  <Badge variant="default" size="md">{formatINR(found.amount)}</Badge>
                </div>
                <p className="mt-3 text-xs text-ink-400">Demo record — not a live ticket. Live booking isn&apos;t available yet.</p>
              </Card>

              <Card title="Details">
                <dl className="space-y-1.5 text-sm">
                  {Object.entries(found.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="text-ink-500">{k}</dt>
                      <dd className="text-right font-medium text-ink-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </>
          ) : trip ? (
            <Card padding="lg" className="text-center">
              <h2 className="text-2xl font-semibold text-ink-900 mb-2">{trip.name}</h2>
              <p className="text-base text-ink-600 mb-4">
                {trip.items.length} item{trip.items.length === 1 ? "" : "s"} · {formatINR(trip.totalAmount)}
              </p>
              <Link href={`/trips/${trip.id}`} className="btn-navy min-h-[48px]">
                View Full Journey
              </Link>
            </Card>
          ) : (
            <Card padding="lg" className="text-center">
              <h2 className="text-2xl font-semibold text-ink-900 mb-2">Nothing found for “{id}”</h2>
              <p className="text-base text-ink-600 mb-4">
                References are stored on this device. If you submitted a booking enquiry, track it with your reference number and phone.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/assistance/track" className="btn-navy min-h-[48px]">Track Enquiry</Link>
                <Link href="/assistance" className="btn-ghost min-h-[48px]">Request Assistance</Link>
              </div>
            </Card>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/trips" className="btn-ghost min-h-[48px]">View My Trips</Link>
            <Link href="/" className="btn-ghost min-h-[48px]">Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
