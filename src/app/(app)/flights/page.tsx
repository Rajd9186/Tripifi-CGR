import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import FlightSearchForm from "@/components/flights/FlightSearchForm";
import { todayISO } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Flights",
  description: "Search and book domestic flights across India with Tripifi CGR. Find the best deals on flights.",
};

export default function FlightsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Search Flights
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Find the best deals on domestic flights across India
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <FlightSearchForm initial={searchParams} />
        </div>
      </section>

      <section className="mt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-ink-900 mb-6">
            Popular Flight Routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { from: "Delhi", to: "Mumbai", price: 4999 },
              { from: "Kolkata", to: "Delhi", price: 10299 },
              { from: "Mumbai", to: "Bengaluru", price: 5499 },
              { from: "Delhi", to: "Goa", price: 7499 },
              { from: "Bengaluru", to: "Hyderabad", price: 3999 },
              { from: "Kolkata", to: "Mumbai", price: 9499 },
              { from: "Chennai", to: "Delhi", price: 11999 },
              { from: "Hyderabad", to: "Delhi", price: 8999 },
            ].map((route) => {
              const params = new URLSearchParams({ from: route.from, to: route.to, date: todayISO(), travellers: "1", class: "Economy", trip: "oneway" });
              return (
              <Link
                key={`${route.from}-${route.to}`}
                href={`/flights/results?${params.toString()}`}
                className="card p-4 hover:shadow-soft transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-ink-900">
                    {route.from} → {route.to}
                  </div>
                </div>
                <div className="text-sm text-ink-600">
                  Starting from{" "}
                  <span className="font-semibold text-ink-900">
                    ₹{route.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <Card padding="lg" className="text-center">
            <h3 className="font-display text-xl font-semibold text-ink-900">
              Why book flights with Tripifi CGR
            </h3>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="font-medium text-ink-900 mb-1">Best Prices</div>
                <div className="text-ink-600">Compare fares across airlines</div>
              </div>
              <div>
                <div className="font-medium text-ink-900 mb-1">Easy Booking</div>
                <div className="text-ink-600">Simple, secure booking process</div>
              </div>
              <div>
                <div className="font-medium text-ink-900 mb-1">24/7 Support</div>
                <div className="text-ink-600">Assistance for all your trips</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
