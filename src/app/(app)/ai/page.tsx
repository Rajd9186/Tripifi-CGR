import type { Metadata } from "next";
import TripifiAI from "@/components/ai/TripifiAI";

export const metadata: Metadata = {
  title: "Tripifi AI",
  description: "Your personal travel concierge. Build complete journeys with Tripifi AI.",
};

export default function AIPage() {
  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full md:h-[700px] rounded-2xl overflow-hidden border border-ink-100 shadow-soft">
        <TripifiAI isFullScreen />
      </div>
    </div>
  );
}
