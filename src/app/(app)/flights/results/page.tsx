import type { Metadata } from "next";
import FlightCard from "@/components/flights/FlightCard";
import { MOCK_FLIGHTS } from "@/data/mockFlights";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Flight Results",
  description: "Flight search results - Tripifi CGR",
};

export default function FlightResultsPage() {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Flight Results
          </h1>
          <p className="mt-2 text-base text-white/80">
            Kolkata (CCU) → Delhi (DEL) • Simulated availability
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Non-stop</Badge>
              <Badge variant="default">Economy</Badge>
              <Badge variant="default">Cheapest</Badge>
            </div>
            <div className="text-sm text-ink-600">
              Showing {MOCK_FLIGHTS.length} flights •{" "}
              <span className="italic">Demo availability</span>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_FLIGHTS.slice(0, 4).map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>

          <Card className="mt-6 text-center" padding="md">
            <p className="text-sm text-ink-600">
              <span className="font-medium">Note:</span> These are simulated fares
              for demonstration purposes only. Actual prices and availability may
              vary.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
