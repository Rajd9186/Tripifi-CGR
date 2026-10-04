import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MOCK_PACKAGES } from "@/data/mockPackages";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return MOCK_PACKAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const pkg = MOCK_PACKAGES.find((p) => p.slug === params.slug);
  if (!pkg) return { title: "Package not found | Tripifi CGR" };
  return {
    title: `${pkg.title}`,
    description: `${pkg.duration} • From ₹${pkg.price.toLocaleString("en-IN")}`,
  };
}

export default function PackageDetailPage({ params }: PageProps) {
  const pkg = MOCK_PACKAGES.find((p) => p.slug === params.slug);
  if (!pkg) notFound();

  return (
    <div className="pb-16">
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
              {pkg.title}
            </h1>
            <p className="mt-3 text-lg text-white/90">{pkg.route}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pkg.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <div className="card p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-ink-600">Duration</div>
                <div className="font-medium text-ink-900">{pkg.duration}</div>
              </div>
              <div>
                <div className="text-sm text-ink-600">Starting from</div>
                <div className="text-3xl font-semibold text-ink-900">
                  ₹{pkg.price.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-ink-600">per person</div>
              </div>
              <div className="flex gap-2">
                <Button href="/checkout">Book Package</Button>
                <Button href="/plan" variant="ghost">
                  Customize Trip
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Highlights">
              <ul className="space-y-2">
                {pkg.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ink-700">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-leaf-600 mt-0.5 flex-shrink-0"
                    >
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Inclusions">
              <div className="flex flex-wrap gap-2">
                {pkg.inclusions.map((i) => (
                  <Badge key={i} variant="success">
                    {i}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Customize This Package">
              <p className="text-sm text-ink-600 mb-4">
                Want to tweak hotels, add activities or change days? Customize this
                package to fit your preferences.
              </p>
              <Button href="/plan" variant="ghost" className="w-full justify-center">
                Customize Trip
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
