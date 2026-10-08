import type { Metadata } from "next";
import MapClient from "@/components/map/MapClient";

export const metadata: Metadata = {
  title: "Map",
  description: "Browse India on the map — search places, tap markers, and plan your journey with Tripifi CGR.",
};

export default function MapPage() {
  return (
    <div className="pb-8 pt-6">
      <MapClient />
    </div>
  );
}
