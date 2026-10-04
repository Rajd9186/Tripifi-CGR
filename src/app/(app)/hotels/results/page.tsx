import type { Metadata } from "next";
import HotelResultsClient from "@/components/hotels/HotelResultsClient";

export const metadata: Metadata = {
  title: "Hotel Results",
  description: "Hotel search results - Tripifi CGR",
};

export default function HotelResultsPage() {
  return <HotelResultsClient />;
}
