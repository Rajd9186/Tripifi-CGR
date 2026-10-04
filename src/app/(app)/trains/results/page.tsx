import type { Metadata } from "next";
import TrainCard from "@/components/trains/TrainCard";
import { MOCK_TRAINS } from "@/data/mockTrains";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Train Results",
  description: "Train search results - Tripifi CGR",
};

export default function TrainResultsPage() {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Train Results
          </h1>
          <p className="mt-2 text-base text-white/80">
            Kolkata → New Delhi • Simulated availability
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 mt-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-ink-600">
              Showing {MOCK_TRAINS.length} trains •{" "}
              <span className="italic">Simulated availability</span>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_TRAINS.map((train) => (
              <TrainCard key={train.id} train={train} />
            ))}
          </div>

          <Card className="mt-6 text-center" padding="md">
            <p className="text-sm text-ink-600">
              <span className="font-medium">Note:</span> These are simulated train
              data for demonstration. Actual availability and fares are subject to
              IRCTC.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
