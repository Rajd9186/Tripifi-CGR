"use client";

import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import DestinationCard from "@/components/destinations/DestinationCard";
import PackageCard from "@/components/packages/PackageCard";
import { DESTINATIONS, findDestination } from "@/lib/destinations";
import { MOCK_PACKAGES } from "@/data/mockPackages";
import { useApp } from "@/lib/store";

export default function WishlistClient() {
  const { wishlist, toggleWishlist } = useApp();

  const dests = wishlist
    .filter((id) => id.startsWith("dest:"))
    .map((id) => findDestination(id.slice(5)))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const pkgs = wishlist
    .filter((id) => id.startsWith("pkg:"))
    .map((id) => MOCK_PACKAGES.find((p) => p.slug === id.slice(4)))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const unknown = wishlist.filter(
    (id) => !id.startsWith("dest:") && !id.startsWith("pkg:")
  );

  const empty = dests.length === 0 && pkgs.length === 0 && unknown.length === 0;

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">SAVED · TRIPIFI CGR</p>
          <h1 className="fluid-section mt-1 font-display font-semibold text-white">Wishlist</h1>
          <p className="mt-2 text-[15px] text-white/80">Your saved destinations, packages and experiences</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-content">
        <div className="max-w-8xl mx-auto space-y-8">
          {empty ? (
            <EmptyState
              title="Your next journey hasn't started yet."
              description="Save places you love and they'll appear here."
              actionLabel="Explore destinations"
              actionHref="/destinations"
            />
          ) : (
            <>
              {dests.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-ink-900 mb-4">Saved Destinations</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dests.map((d) => (
                      <DestinationCard key={d.slug} destination={d} />
                    ))}
                  </div>
                </div>
              )}
              {pkgs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-ink-900 mb-4">Saved Packages</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pkgs.map((p) => (
                      <PackageCard key={p.slug} pkg={p} />
                    ))}
                  </div>
                </div>
              )}
              {unknown.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-ink-900 mb-4">Saved Items</h2>
                  <ul className="space-y-2">
                    {unknown.map((id) => (
                      <li key={id} className="card flex items-center justify-between gap-2 p-4 text-sm">
                        <span className="text-ink-800">{id}</span>
                        <button onClick={() => toggleWishlist(id)} className="btn-ghost min-h-[44px] text-sm">
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Link href="/destinations" className="btn-ghost min-h-[48px] text-sm">Explore destinations</Link>
                <Link href="/packages" className="btn-ghost min-h-[48px] text-sm">Explore packages</Link>
              </div>
            </>
          )}
          {/* Keep tree-shaken reference for future trip saves */}
          <span className="hidden">{DESTINATIONS.length > 0 ? "" : ""}</span>
        </div>
      </section>
    </div>
  );
}
