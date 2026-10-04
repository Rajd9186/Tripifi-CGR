import type { Metadata } from "next";
import PackagesClient from "@/components/packages/PackagesClient";

export const metadata: Metadata = {
  title: "Packages",
  description: "Curated travel packages for India. Honeymoon, family, adventure and more with Tripifi CGR.",
};

export default function PackagesPage() {
  return <PackagesClient />;
}
