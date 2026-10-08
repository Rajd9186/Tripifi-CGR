"use client";

import BookingEnquiryForm, { type EnquirySummaryRow } from "@/components/booking/BookingEnquiryForm";
import type { BookingEnquiry, EnquiryType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * AssistedFallbackCard — shown whenever a service can't complete instantly:
 * ASSISTED mode, UNAVAILABLE / RATE_LIMITED / TIMEOUT / NOT_SUPPORTED /
 * NO_RESULTS states, or when the user clicks "Get this arranged" on a result.
 *
 * Selected details are shown back (visible + editable in the form below).
 * Only name + phone are required; email optional; consent required.
 */
export interface AssistedFallbackPrefill extends Partial<BookingEnquiry> {
  serviceLabel?: string;
}

export default function AssistedFallbackCard({
  type,
  title = "Let Tripifi arrange it for you",
  description = "This can't be completed instantly. Share your details and a customer representative will contact you shortly to confirm availability and arrange the best option.",
  prefill,
  summary,
  tripSnapshot,
  className,
}: {
  type: EnquiryType;
  title?: string;
  description?: string;
  prefill?: AssistedFallbackPrefill;
  summary?: EnquirySummaryRow[];
  tripSnapshot?: Record<string, unknown>;
  className?: string;
}) {
  const { serviceLabel, ...formPrefill } = prefill ?? {};
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-saffron-50 p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white"
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="micro-meta text-[10px] text-teal-700">
            TRIPIFI TRAVEL ASSISTANCE{serviceLabel ? ` · ${serviceLabel.toUpperCase()}` : ""}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">{description}</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
        <BookingEnquiryForm
          type={type}
          prefill={formPrefill}
          summary={summary}
          tripSnapshot={tripSnapshot}
          inlineSuccess
        />
      </div>
    </div>
  );
}
