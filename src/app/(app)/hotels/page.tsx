import type { Metadata } from "next";
import HotelSearchClient from "@/components/hotels/HotelSearchClient";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Search comfortable stays across India with Tripifi CGR.",
};

export default function HotelsPage() {
  return <HotelSearchClient />;
}
