import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DESTINATIONS, findDestination } from "@/lib/destinations";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import DestinationHero from "@/components/destinations/DestinationHero";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const destination = findDestination(params.slug);
  if (!destination) {
    return { title: "Destination not found | Tripifi CGR" };
  }
  return {
    title: `${destination.name}, ${destination.state}`,
    description: destination.overview,
  };
}

export default function DestinationDetailPage({ params }: PageProps) {
  const destination = findDestination(params.slug);
  if (!destination) notFound();

  return (
    <div className="pb-16">
      <DestinationHero destination={destination} />

      <section className="px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="max-w-8xl mx-auto">
          <div className="card p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-ink-500">Best Time</div>
                <div className="font-medium text-ink-900 mt-1">
                  {destination.bestTime}
                </div>
              </div>
              <div>
                <div className="text-ink-500">Ideal Duration</div>
                <div className="font-medium text-ink-900 mt-1">
                  {destination.idealDuration}
                </div>
              </div>
              <div>
                <div className="text-ink-500">Budget</div>
                <div className="font-medium text-ink-900 mt-1">
                  {destination.estimatedBudget}
                </div>
              </div>
              <div>
                <div className="text-ink-500">State</div>
                <div className="font-medium text-ink-900 mt-1">
                  {destination.state}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900 mb-4">
                  Overview
                </h2>
                <p className="text-base text-ink-700 leading-relaxed">
                  {destination.overview}
                </p>
              </div>

              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900 mb-6">
                  Top Attractions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {destination.attractions.map((attraction: any) => (
                    <div key={attraction.name} className="border border-ink-100 rounded-xl p-4">
                      <h3 className="font-semibold text-ink-900 mb-2">
                        {attraction.name}
                      </h3>
                      <p className="text-sm text-ink-600 leading-relaxed">
                        {attraction.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900 mb-6">
                  Things to Do
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {destination.thingsToDo.map((thing: string) => (
                    <div key={thing} className="flex items-center gap-2 text-sm text-ink-700">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-leaf-600 flex-shrink-0"
                      >
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      {thing}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900 mb-6">
                  Travel Tips
                </h2>
                <ul className="space-y-2">
                  {destination.tips.map((tip: string) => (
                    <li key={tip} className="flex gap-3 text-sm text-ink-700">
                      <span className="text-saffron-600">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h3 className="font-semibold text-ink-900 mb-4">
                  How to Reach
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-ink-900">By Air</div>
                    <div className="text-ink-600 mt-1 leading-relaxed">
                      {destination.howToReach.air}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-ink-900">By Train</div>
                    <div className="text-ink-600 mt-1 leading-relaxed">
                      {destination.howToReach.train}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-ink-900">By Road</div>
                    <div className="text-ink-600 mt-1 leading-relaxed">
                      {destination.howToReach.road}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink-900 mb-4">
                  Best Time to Visit
                </h3>
                <div className="space-y-3">
                  {destination.weather.map((w: any) => (
                    <div
                      key={w.season}
                      className="border-b border-ink-100 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-ink-900">
                          {w.season}
                        </span>
                        <span className="text-sm text-ink-600">{w.temp}</span>
                      </div>
                      <p className="text-xs text-ink-600">{w.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink-900 mb-4">
                  Nearby Destinations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {destination.nearby.map((near: string) => {
                    const nearDest = findDestination(near);
                    return (
                      <Link key={near} href={`/destinations/${near}`}>
                        <Badge variant="info" className="hover:bg-navy-100 transition-colors">
                          {nearDest ? nearDest.name : near}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink-900 mb-4">
                  Start Your Trip
                </h3>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/plan"
                    className="btn-primary w-full justify-center text-sm"
                  >
                    Build Custom Itinerary
                  </Link>
                  <Link
                    href="/packages"
                    className="btn-ghost w-full justify-center text-sm"
                  >
                    Browse Packages
                  </Link>
                  <Link
                    href="/flights"
                    className="btn-ghost w-full justify-center text-sm"
                  >
                    Search Flights
                  </Link>
                  <Link
                    href="/cabs"
                    className="btn-ghost w-full justify-center text-sm"
                  >
                    Book Private Cab
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
