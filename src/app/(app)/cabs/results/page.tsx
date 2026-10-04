import type { Metadata } from "next";
import CabCard from "@/components/cabs/CabCard";
import { MOCK_CABS } from "@/data/mockCabs";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Cab Results",
  description: "Available cabs for your journey - Tripifi CGR",
};

export default function CabResultsPage() {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Available Cabs
          </h1>
          <p className="mt-2 text-base text-white/80">
            Kolkata Airport → Park Street • Simulated availability
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">One Way</Badge>
              <Badge variant="default">All Vehicles</Badge>
            </div>
            <div className="text-sm text-ink-600">
              Showing {MOCK_CABS.length} cabs •{" "}
              <span className="italic">Simulated availability</span>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_CABS.map((cab) => (
              <CabCard key={cab.id} cab={cab} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
