import Link from "next/link";
import { DESTINATIONS } from "@/lib/destinations";
import DestinationCard from "@/components/destinations/DestinationCard";

const trending = DESTINATIONS.slice(0, 8);

export default function TrendingDestinations() {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
              Trending Destinations
            </h2>
            <p className="mt-1 text-base text-ink-600">
              Discover India's most-loved getaways
            </p>
          </div>
          <Link
            href="/destinations"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-navy-900 hover:gap-3 transition-all"
          >
            View all destinations
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trending.map((dest, index) => (
            <DestinationCard
              key={dest.slug}
              destination={dest}
              variant="default"
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}