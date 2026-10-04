import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your booking with Tripifi CGR.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
