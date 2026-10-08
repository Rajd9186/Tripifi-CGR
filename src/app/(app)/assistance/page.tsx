import type { Metadata } from "next";
import BookingEnquiryForm from "@/components/booking/BookingEnquiryForm";
import type { EnquiryType } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Request Booking Assistance",
  description: "Let Tripifi arrange your journey. Share your requirements and our travel team will help.",
};

const TITLES: Record<string, { title: string; blurb: string }> = {
  FLIGHT: { title: "Need help booking this flight?", blurb: "Share your flight requirements and our travel team will check availability and arrange the best option." },
  TRAIN: { title: "Need help booking this train?", blurb: "Share your train requirements and our travel team will check availability and arrange it for you." },
  HOTEL: { title: "Let Tripifi find the right hotel for you", blurb: "Tell us your dates, budget and preferences — we'll arrange suitable options." },
  CAB: { title: "Need help arranging this cab?", blurb: "Share your route and our team will confirm the vehicle and estimated fare." },
  PACKAGE: { title: "Request package confirmation", blurb: "Share your details and we'll confirm availability and customize this package for you." },
  CUSTOM_TRIP: { title: "Let Tripifi arrange your entire journey", blurb: "One consolidated request — our travel team will plan, quote and arrange the complete trip." },
  MULTI_SERVICE: { title: "Let Tripifi arrange your entire journey", blurb: "One consolidated request — our travel team will plan, quote and arrange the complete trip." },
};

export default async function AssistancePage(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const raw = (searchParams.type ?? "CUSTOM_TRIP").toUpperCase();
  const type = (["FLIGHT", "TRAIN", "HOTEL", "CAB", "PACKAGE", "CUSTOM_TRIP", "MULTI_SERVICE"] as EnquiryType[]).includes(raw as EnquiryType)
    ? (raw as EnquiryType)
    : "CUSTOM_TRIP";
  const copy = TITLES[type];

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">TRIPIFI TRAVEL ASSISTANCE</p>
          <h1 className="fluid-section mt-1 font-display font-semibold text-white">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-white/80">{copy.blurb}</p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-5">
          <div className="card p-5 sm:p-6 lg:col-span-3">
            <BookingEnquiryForm
              type={type}
              prefill={{
                origin: searchParams.origin,
                destination: searchParams.destination,
                travel_start_date: searchParams.start,
                travel_end_date: searchParams.end,
                traveller_count: searchParams.travellers ? Number(searchParams.travellers) : 2,
              }}
            />
          </div>
          <aside className="card h-fit p-5 sm:p-6 lg:col-span-2 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold text-ink-900">What happens next?</h2>
            <ol className="mt-3 space-y-3 text-sm text-ink-600">
              {["Request received with a TFC reference number", "Assigned to a travel representative", "Availability checked and quote prepared", "You approve — then booking is arranged"].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[11px] font-bold text-text">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </div>
  );
}
