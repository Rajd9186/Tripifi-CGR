import type { Metadata } from "next";
import WishlistClient from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved destinations and trips with Tripifi CGR.",
};

export default function WishlistPage() {
  return <WishlistClient />;
}
