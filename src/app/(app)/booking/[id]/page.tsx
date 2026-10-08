import type { Metadata } from "next";
import BookingClient from "./BookingClient";

export const metadata: Metadata = {
  title: "Booking Details",
  description: "View your booking or trip reference with Tripifi CGR.",
};

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingClient id={id} />;
}
