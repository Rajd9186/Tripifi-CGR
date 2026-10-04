"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PackageCard from "@/components/packages/PackageCard";
import { MOCK_PACKAGES } from "@/data/mockPackages";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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

function budgetBand(price: number): string {
  if (price < 20000) return "Under ₹20,000";
  if (price < 40000) return "₹20,000 - ₹40,000";
  if (price < 60000) return "₹40,000 - ₹60,000";
  if (price < 80000) return "₹60,000 - ₹80,000";
  return "Above ₹80,000";
}

export default function PackagesClient() {
  const params = useSearchParams();
  const urlDestination = (params.get("destination") ?? "").toLowerCase();
  const urlBudget = params.get("budget") ?? "";
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState(urlDestination);

  const visible = useMemo(() => {
    return MOCK_PACKAGES.filter((pkg) => {
      if (category !== "All" && !pkg.tags.some((t) => t.toLowerCase() === category.toLowerCase())) return false;
      if (query && !`${pkg.title} ${pkg.route} ${pkg.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (urlBudget && budgetBand(pkg.price) !== urlBudget) return false;
      return true;
    });
  }, [category, query, urlBudget]);

  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="micro-meta text-[11px] text-white/50">CURATED · TRIPIFI CGR</p>
            <h1 className="fluid-section mt-1 font-display font-semibold tracking-tight text-white">
              Curated Packages
            </h1>
            <p className="mt-3 text-[15px] text-white/80">
              Handcrafted itineraries for every kind of traveler
              {urlBudget ? ` · ${urlBudget}` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <Card padding="md">
            <div className="mb-3">
              <label className="input-label" htmlFor="pkg-search">Search packages</label>
              <input
                id="pkg-search"
                className="field min-h-[52px]"
                placeholder="Try 'Sikkim' or 'Honeymoon'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  className={cn("chip min-h-[44px]", category === cat && "chip-active")}
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
          <p className="mb-4 text-sm text-ink-600">
            Showing {visible.length} package{visible.length === 1 ? "" : "s"}
          </p>
          {visible.length === 0 ? (
            <Card padding="lg" className="text-center">
              <h3 className="text-lg font-semibold text-ink-900 mb-2">No packages match those filters.</h3>
              <p className="text-sm text-ink-600 mb-4">Try another destination, budget, or category — or let our team craft one for you.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => { setCategory("All"); setQuery(""); }} className="btn-ghost min-h-[48px] text-sm">Clear filters</button>
                <a href="/assistance?type=PACKAGE" className="btn-primary min-h-[48px] text-sm">Request Custom Package</a>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visible.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
