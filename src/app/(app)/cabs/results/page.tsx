import type { Metadata } from "next";
import CabResultsClient from "@/components/cabs/CabResultsClient";

export const metadata: Metadata = {
  title: "Cab Results",
  description: "Available cabs for your journey - Tripifi CGR",
};

export default function CabResultsPage() {
  return <CabResultsClient />;
}
