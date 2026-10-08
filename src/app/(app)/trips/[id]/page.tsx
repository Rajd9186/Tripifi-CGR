import type { Metadata } from "next";
import TripDetailClient from "@/components/trips/TripDetailClient";

export const metadata: Metadata = {
  title: "Trip Details",
  description: "View your complete journey with Tripifi CGR.",
};

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetailClient id={id} />;
}
