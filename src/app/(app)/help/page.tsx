import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, RotateCcw, ShieldCheck, MessagesSquare, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Help & FAQs",
  description: "Answers about bookings, cancellations, privacy, and getting human help with Tripifi CGR.",
};

const FAQS = [
  {
    q: "How do I book a flight, train, hotel, or cab?",
    a: "Search on the Flights, Trains, Hotels, or Cabs pages. When live availability is shown you can proceed; when it isn't, use the Request Booking button — our team confirms availability and arranges it for you, and you can track the enquiry anytime.",
  },
  {
    q: "What happens after I request assistance?",
    a: "You get a TFC reference number instantly. A travel representative is assigned, checks availability, prepares a quote, and arranges the booking only after you approve. Track progress on the Track page with your reference.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. Cancellation terms depend on the provider (airline, hotel, cab operator). Request changes from the Track page or the Assistance page and our team will confirm what refund or rescheduling applies before anything is charged.",
  },
  {
    q: "How is my personal data used?",
    a: "We use your name, phone, and trip details only to arrange your enquiry — nothing is sold or shared for marketing. Submitting a request implies consent to be contacted about that enquiry only.",
  },
  {
    q: "The app says the server is waking up. What does that mean?",
    a: "Our backend sleeps when idle to save resources. The first request can take up to 30 seconds — just retry, and everything will respond normally afterwards.",
  },
  {
    q: "Do I need permits for places like Nathula or Rohtang?",
    a: "Some restricted areas need permits arranged 1–2 days ahead through a registered operator. Tell us your destination in the Assistance form and we'll handle permits as part of your trip.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <p className="micro-meta text-[11px] uppercase text-[#FFB454]">Help center</p>
      <h1 className="mt-2 font-display text-display-lg font-semibold tracking-tight text-text">
        How can we help?
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        Quick answers below — or skip straight to a human at any time.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/assistance"
          className="journey-press flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 backdrop-blur-xl"
        >
          <MessagesSquare className="h-6 w-6 shrink-0 text-[#FFB454]" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold text-text">Talk to a human</span>
            <span className="block text-xs text-text-dim">Request booking help</span>
          </span>
        </Link>
        <Link
          href="/assistance/track"
          className="journey-press flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 backdrop-blur-xl"
        >
          <RotateCcw className="h-6 w-6 shrink-0 text-[#19C3B2]" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold text-text">Track enquiry</span>
            <span className="block text-xs text-text-dim">Use your TFC reference</span>
          </span>
        </Link>
        <Link
          href="/plan"
          className="journey-press flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 backdrop-blur-xl"
        >
          <HelpCircle className="h-6 w-6 shrink-0 text-[#FF6B6B]" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold text-text">Plan a trip</span>
            <span className="block text-xs text-text-dim">Build a custom journey</span>
          </span>
        </Link>
      </div>

      <section aria-labelledby="faqs-heading" className="mt-10" id="faqs">
        <h2 id="faqs-heading" className="font-display text-heading-lg font-semibold text-text">
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-surface backdrop-blur-xl"
            >
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-text [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-[#FFB454] transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="policies-heading" className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2" id="policies">
        <div className="rounded-2xl border border-border bg-surface p-5 backdrop-blur-xl">
          <h2 id="policies-heading" className="flex items-center gap-2 font-display text-heading-sm font-semibold text-text">
            <RotateCcw className="h-5 w-5 text-[#FFB454]" aria-hidden="true" />
            Cancellations
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Provider terms apply (airlines, hotels, cab operators). We confirm
            the exact refund or rescheduling option before charging anything —
            request changes via the Assistance page.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 backdrop-blur-xl">
          <h2 className="flex items-center gap-2 font-display text-heading-sm font-semibold text-text">
            <ShieldCheck className="h-5 w-5 text-[#19C3B2]" aria-hidden="true" />
            Privacy & terms
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Your details are used only to arrange your enquiry and are never
            sold. By requesting assistance you agree to be contacted about that
            enquiry. Prices shown are estimates until confirmed by our team.
          </p>
        </div>
      </section>
    </div>
  );
}
