import type { Metadata } from "next";
import TripsClient from "@/components/trips/TripsClient";

export const metadata: Metadata = {
  title: "My Trips",
  description: "Manage your trips and bookings with Tripifi CGR.",
};

export default function TripsPage() {
  return <TripsClient />;
}
