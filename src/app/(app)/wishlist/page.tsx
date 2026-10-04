import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { DESTINATIONS } from "@/lib/destinations";
import DestinationCard from "@/components/destinations/DestinationCard";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved destinations and trips with Tripifi CGR.",
};

export default function WishlistPage() {
  const saved = DESTINATIONS.slice(0, 3);

  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            Wishlist
          </h1>
          <p className="mt-2 text-base text-white/80">
            Your saved destinations, packages and experiences
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-8xl mx-auto">
          {saved.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold text-ink-900 mb-4">
                Saved Destinations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {saved.map((d) => (
                  <DestinationCard key={d.slug} destination={d} />
                ))}
              </div>
            </>
          ) : (
            <Card padding="lg" className="text-center">
              <h3 className="text-lg font-semibold text-ink-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-sm text-ink-600 mb-4">
                Save destinations and packages you love for easy access later
              </p>
              <Button href="/destinations">Explore Destinations</Button>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
