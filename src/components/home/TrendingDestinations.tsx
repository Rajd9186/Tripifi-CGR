import Link from "next/link";
import { DESTINATIONS } from "@/lib/destinations";

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
          {trending.map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-ink-900 h-72"
            >
              <img
                src={dest.heroImage}
                alt={dest.name}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-xs text-white/80 uppercase tracking-wider mb-1">
                  {dest.region}
                </div>
                <h3 className="font-display text-xl font-semibold text-white">
                  {dest.name}
                </h3>
                <p className="text-sm text-white/90 mt-1 line-clamp-2">
                  {dest.tagline}
                </p>
                <div className="mt-2 text-xs text-white/80">
                  From ₹{dest.estimatedBudget.split("₹")[1]?.split("–")[0] || "15,000"} onwards
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
