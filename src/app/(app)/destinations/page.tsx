import type { Metadata } from "next";
import { Suspense } from "react";
import DestinationsClient from "./DestinationsClient";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore India's most beautiful destinations. From mountains to beaches, find your perfect getaway with Tripifi CGR.",
};

export default function DestinationsPage() {
  return (
    <Suspense>
      <DestinationsClient />
    </Suspense>
  );
}
