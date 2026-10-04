import type { Metadata } from "next";
import TrackClient from "@/components/booking/TrackClient";

export const metadata: Metadata = {
  title: "Track Your Enquiry",
  description: "Check the status of your Tripifi CGR booking enquiry.",
};

export default function TrackPage({ searchParams }: { searchParams: { ref?: string } }) {
  return <TrackClient initialRef={searchParams.ref} />;
}
