import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Trips",
  description: "Manage your trips and bookings with Tripifi CGR.",
};

const mockTrips = [
  {
    id: "YT-2026-1031",
    title: "Sikkim Escape",
    route: "NJP → Gangtok → Pelling → NJP",
    date: "2026-11-06",
    amount: 69998,
    status: "upcoming" as const,
    type: "package",
    duration: "5 Nights / 6 Days",
  },
  {
    id: "YT-2026-1042",
    title: "Kolkata → Delhi",
    route: "CCU → DEL",
    date: "2026-12-12",
    amount: 11464,
    status: "upcoming" as const,
    type: "flight",
  },
];

export default function TripsPage() {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            My Trips
          </h1>
          <p className="mt-2 text-base text-white/80">
            Manage your upcoming and completed journeys
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-8xl mx-auto">
          {mockTrips.length > 0 ? (
            <div className="space-y-4">
              {mockTrips.map((trip) => (
                <Card key={trip.id} padding="md">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-ink-900">
                          {trip.title}
                        </h3>
                        <Badge
                          variant={
                            trip.status === "upcoming" ? "info" : "default"
                          }
                        >
                          {trip.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-ink-600">{trip.route}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-ink-600">
                        <div>Date: {trip.date}</div>
                        {trip.duration && <div>{trip.duration}</div>}
                        <div>Booking ID: {trip.id}</div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:items-end gap-3">
                      <div className="text-right">
                        <div className="text-xs text-ink-500">Total Amount</div>
                        <div className="text-xl font-semibold text-ink-900">
                          ₹{trip.amount.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button href={`/booking/${trip.id}`} variant="ghost" size="sm">
                          View Details
                        </Button>
                        <Button href="/plan" size="sm">
                          Modify Trip
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg" className="text-center">
              <h3 className="text-lg font-semibold text-ink-900 mb-2">
                No trips yet
              </h3>
              <p className="text-sm text-ink-600 mb-4">
                Start exploring and build your first journey with Tripifi CGR
              </p>
              <Button href="/plan">Plan a Trip</Button>
            </Card>
          )}

          <Card className="mt-6 text-center" padding="md">
            <p className="text-sm text-ink-600">
              Trips are unified journeys - flights, cabs, stays and activities all
              in one place.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
