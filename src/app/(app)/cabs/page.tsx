import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import CabSearchForm from "@/components/cabs/CabSearchForm";

export const metadata: Metadata = {
  title: "Private Cabs",
  description: "Book private cabs for local, outstation and airport transfers across India with Tripifi CGR.",
};

export default async function CabsPage(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Book Private Cabs
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Reliable, safe and comfortable cabs for every journey
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <CabSearchForm initial={searchParams} />
        </div>
      </section>

      <section className="mt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-ink-900 mb-6">
            Why book with Tripifi CGR
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Verified Drivers", desc: "Background checked, experienced drivers" },
              { title: "Transparent Pricing", desc: "No hidden charges, fare breakup upfront" },
              { title: "Safe & Reliable", desc: "Real-time tracking & 24/7 support" },
            ].map((f) => (
              <Card key={f.title} padding="md">
                <h3 className="font-semibold text-ink-900 mb-1">{f.title}</h3>
                <p className="text-sm text-ink-600">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
