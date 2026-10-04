import type { Metadata } from "next";
import Link from "next/link";
import TrainSearchForm from "@/components/trains/TrainSearchForm";
import { todayISO } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trains",
  description: "Search and book Indian Railways trains with Tripifi CGR. Find availability and fares across all classes.",
};

export default function TrainsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Search Trains
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Book Indian Railways tickets across all classes with Tripifi CGR
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <TrainSearchForm initial={searchParams} />
        </div>
      </section>

      <section className="mt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-ink-900 mb-6">
            Popular Train Routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { from: "Kolkata", to: "Delhi", name: "Rajdhani" },
              { from: "Mumbai", to: "Delhi", name: "Express" },
              { from: "Bengaluru", to: "Chennai", name: "Shatabdi" },
              { from: "Delhi", to: "Dehradun", name: "Shatabdi" },
              { from: "Kolkata", to: "Puri", name: "Express" },
              { from: "Chennai", to: "Hyderabad", name: "Express" },
              { from: "Mumbai", to: "Goa", name: "Express" },
              { from: "Delhi", to: "Lucknow", name: "Shatabdi" },
            ].map((route) => {
              const params = new URLSearchParams({ from: route.from, to: route.to, date: todayISO(), class: "All Classes", quota: "General" });
              return (
              <Link
                key={`${route.from}-${route.to}`}
                href={`/trains/results?${params.toString()}`}
                className="card p-4 hover:shadow-soft transition"
              >
                <div className="font-medium text-ink-900">
                  {route.from} → {route.to}
                </div>
                <div className="text-sm text-ink-600 mt-1">{route.name}</div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
