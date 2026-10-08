import type { Metadata } from "next";
import TrackClient from "@/components/booking/TrackClient";

export const metadata: Metadata = {
  title: "Track Your Enquiry",
  description: "Check the status of your Tripifi CGR booking enquiry.",
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <TrackClient initialRef={ref} />;
}
