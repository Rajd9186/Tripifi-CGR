import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: "Booking Confirmation",
  description: "Your booking has been confirmed - Tripifi CGR.",
};

export default function BookingPage({ params }: PageProps) {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            Booking Confirmation
          </h1>
          <p className="mt-2 text-base text-white/80">
            Thank you for booking with Tripifi CGR
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card padding="lg" className="text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-leaf-50 flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-leaf-600"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-ink-900 mb-2">
              Booking Confirmed
            </h2>
            <p className="text-base text-ink-600 mb-4">
              Your trip has been successfully booked
            </p>
            <Badge variant="success" size="md">
              Booking ID: {params.id}
            </Badge>
          </Card>

          <Card title="Journey Timeline">
            <p className="text-sm text-ink-600">
              View your complete journey details in My Trips
            </p>
          </Card>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button href="/trips">View My Trips</Button>
            <Button href="/" variant="ghost">
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
