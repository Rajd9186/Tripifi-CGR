import type { Metadata } from "next";
import FlightResultsClient from "@/components/flights/FlightResultsClient";

export const metadata: Metadata = {
  title: "Flight Results",
  description: "Flight search results - Tripifi CGR",
};

export default function FlightResultsPage() {
  return <FlightResultsClient />;
}
