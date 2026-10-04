import type { Metadata } from "next";
import PackageCard from "@/components/packages/PackageCard";
import { MOCK_PACKAGES } from "@/data/mockPackages";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Packages",
  description: "Curated travel packages for India. Honeymoon, family, adventure and more with Tripifi CGR.",
};

const categories = [
  "All",
  "Honeymoon",
  "Family",
  "Adventure",
  "Luxury",
  "Budget",
  "Mountains",
  "Beaches",
  "Heritage",
];

export default function PackagesPage() {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Curated Packages
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Handcrafted itineraries for every kind of traveler
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <Card padding="md">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  className={`chip ${i === 0 ? "chip-active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MOCK_PACKAGES.map((pkg) => (
              <PackageCard key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
