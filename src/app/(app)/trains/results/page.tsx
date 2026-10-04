import type { Metadata } from "next";
import TrainResultsClient from "@/components/trains/TrainResultsClient";

export const metadata: Metadata = {
  title: "Train Results",
  description: "Train search results - Tripifi CGR",
};

export default function TrainResultsPage() {
  return <TrainResultsClient />;
}
