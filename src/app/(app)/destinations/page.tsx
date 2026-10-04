import type { Metadata } from "next";
import { DESTINATIONS } from "@/lib/destinations";
import DestinationCard from "@/components/destinations/DestinationCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore India's most beautiful destinations. From mountains to beaches, find your perfect getaway with Tripifi CGR.",
};

const categories = [
  { name: "All Destinations", slug: "all" },
  { name: "Mountains", slug: "mountains" },
  { name: "Beaches", slug: "beaches" },
  { name: "Heritage", slug: "heritage" },
  { name: "Northeast", slug: "northeast" },
  { name: "South India", slug: "south" },
];

export default function DestinationsPage() {
  return (
    <div className="pb-16">
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/30" />
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
            alt="India destinations - Tripifi CGR"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
              Explore India
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed">
              Discover the diverse beauty of India. From the Himalayas to the
              coast, find your next adventure with Tripifi CGR.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="max-w-8xl mx-auto">
          <div className="card p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category, index) => (
                <button
                  key={category.slug}
                  className={`chip ${
                    index === 0 ? "chip-active" : ""
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 mb-6">
            All Destinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DESTINATIONS.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="card p-6 sm:p-10 text-center">
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
              Can't find what you're looking for?
            </h3>
            <p className="mt-3 text-base text-ink-600 max-w-xl mx-auto">
              Tell us your preferences and Tripifi CGR will build a custom trip
              just for you.
            </p>
            <div className="mt-6">
              <Link href="/plan" className="btn-primary">
                Plan a Custom Trip
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
