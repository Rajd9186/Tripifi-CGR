import type { Metadata } from "next";
import TripifiAI from "@/components/ai/TripifiAI";

export const metadata: Metadata = {
  title: "Tripifi AI",
  description: "Your personal travel concierge. Build complete journeys with Tripifi AI.",
};

export default function AIPage() {
  return (
    <div className="flex min-h-[calc(100dvh-64px-var(--content-pb-mobile))] items-center justify-center p-4 md:min-h-0 md:h-[calc(100vh-80px)]">
      <div className="h-[70dvh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border shadow-soft md:h-[700px]">
        <TripifiAI isFullScreen />
      </div>
    </div>
  );
}
