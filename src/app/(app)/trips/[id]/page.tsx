import type { Metadata } from "next";
import TripDetailClient from "@/components/trips/TripDetailClient";

export const metadata: Metadata = {
  title: "Trip Details",
  description: "View your complete journey with Tripifi CGR.",
};

export default function TripDetailPage({ params }: { params: { id: string } }) {
  return <TripDetailClient id={params.id} />;
}
