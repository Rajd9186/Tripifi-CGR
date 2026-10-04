import type { Metadata } from "next";
import EmptyState from "@/components/ui/EmptyState";
import { DESTINATIONS } from "@/lib/destinations";
import DestinationCard from "@/components/destinations/DestinationCard";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved destinations and trips with Tripifi CGR.",
};

export default function WishlistPage() {
  const saved = DESTINATIONS.slice(0, 3);

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">SAVED · TRIPIFI CGR</p>
          <h1 className="fluid-section mt-1 font-display font-semibold text-white">
            Wishlist
          </h1>
          <p className="mt-2 text-[15px] text-white/80">
            Your saved destinations, packages and experiences
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-content">
        <div className="max-w-8xl mx-auto">
          {saved.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold text-ink-900 mb-4">
                Saved Destinations
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((d) => (
                  <DestinationCard key={d.slug} destination={d} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="Your next journey hasn't started yet."
              description="Save places you love and they'll appear here."
              actionLabel="Explore destinations"
              actionHref="/destinations"
            />
          )}
        </div>
      </section>
    </div>
  );
}
