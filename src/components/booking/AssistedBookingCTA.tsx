"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AssistedBookingCTA({
  title = "Let Tripifi arrange it for you",
  description = "Some journeys need a little more personalization. Share your requirements and our travel team will check availability and arrange the best option for you.",
  href = "/assistance",
  prefill,
  compact = false,
  className,
}: {
  title?: string;
  description?: string;
  href?: string;
  prefill?: Record<string, string>;
  compact?: boolean;
  className?: string;
}) {
  const url = prefill
    ? `${href}?${new URLSearchParams(prefill).toString()}`
    : href;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-saffron-50 p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="micro-meta text-[10px] text-teal-700">TRIPIFI TRAVEL ASSISTANCE</p>
          <h3 className={cn("mt-1 font-display font-semibold text-ink-900", compact ? "text-base" : "text-lg")}>{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">{description}</p>
          <Link href={url} className="btn-teal mt-4 inline-flex min-h-[48px]">
            Request Booking Assistance
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Alias kept for spec naming: BookingFallbackCard */
export function BookingFallbackCard(props: React.ComponentProps<typeof AssistedBookingCTA>) {
  return <AssistedBookingCTA {...props} />;
}
