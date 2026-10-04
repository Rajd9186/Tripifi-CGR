import type { Metadata } from "next";
import PlanClient from "@/components/trip-builder/PlanClient";

export const metadata: Metadata = {
  title: "Trip Builder",
  description: "Build your complete journey with Tripifi CGR. Customize your itinerary, add transport, hotels and activities.",
};

export default function PlanPage() {
  return <PlanClient />;
}
