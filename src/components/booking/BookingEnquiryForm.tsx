"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enquiriesApi, newIdempotencyKey } from "@/lib/api/enquiries";
import { track } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client";
import type { BookingEnquiry, EnquiryType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const PHONE_RE = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

function normalizePhoneClient(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(ten)) throw new Error("INVALID_PHONE");
  return `+91${ten}`;
}

export interface EnquirySummaryRow {
  label: string;
  value: string;
}

export default function BookingEnquiryForm({
  type,
  prefill,
  tripSnapshot,
  onSuccess,
  summary,
  inlineSuccess = false,
}: {
  type: EnquiryType;
  prefill?: Partial<BookingEnquiry>;
  tripSnapshot?: Record<string, unknown>;
  onSuccess?: (reference: string, customerName: string) => void;
  /** Selected details shown back to the user (visible + editable below). */
  summary?: EnquirySummaryRow[];
  /** Render the success state inline instead of navigating away. */
  inlineSuccess?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    customer_name: prefill?.customer_name ?? "",
    phone: prefill?.phone ?? "",
    email: prefill?.email ?? "",
    preferred_contact_time: prefill?.preferred_contact_time ?? "",
    website: "",
    origin: prefill?.origin ?? "",
    destination: prefill?.destination ?? "",
    travel_start_date: prefill?.travel_start_date ?? "",
    travel_end_date: prefill?.travel_end_date ?? "",
    traveller_count: prefill?.traveller_count ?? 2,
    budget: prefill?.budget ?? undefined as number | undefined,
    special_requirements: prefill?.special_requirements ?? "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ reference: string; name: string } | null>(null);
  const [idemKey] = useState(() => newIdempotencyKey());

  const set = (k: keyof typeof form, v: string | number | boolean | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.customer_name.trim().length < 2) e.customer_name = "Full name is required.";
    if (!PHONE_RE.test(form.phone.trim()) && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      e.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address, or leave it blank.";
    }
    if (form.travel_start_date && form.travel_end_date && form.travel_end_date < form.travel_start_date) {
      e.travel_end_date = "Return date must be on or after the travel date.";
    }
    if (form.traveller_count < 1) e.traveller_count = "At least 1 traveller is required.";
    if (!form.consent) e.consent = "Please agree to be contacted about this enquiry.";
    return e;
  }, [form]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (receipt) return; // duplicate-click safe: already submitted.
    setErrors(valid);
    setSubmitError(null);
    if (Object.keys(valid).length > 0) return;
    setSubmitting(true);
    track("fallback_started", { type });
    try {
      const created = await enquiriesApi.create(
        {
          type,
          customer_name: form.customer_name.trim(),
          phone: normalizePhoneClient(form.phone),
          email: form.email.trim() || undefined,
          preferred_contact_time: form.preferred_contact_time.trim() || undefined,
          website: form.website || undefined,
          origin: form.origin.trim() || undefined,
          destination: form.destination.trim() || undefined,
          travel_start_date: form.travel_start_date || undefined,
          travel_end_date: form.travel_end_date || undefined,
          traveller_count: Number(form.traveller_count),
          budget: form.budget ? Number(form.budget) : undefined,
          special_requirements: form.special_requirements.trim() || undefined,
          source: "web",
          trip_snapshot: tripSnapshot,
          consent: true,
          service_details: { type },
        },
        idemKey
      );
      const name = form.customer_name.trim();
      track("fallback_completed", { type, reference: created.reference_number });
      if (inlineSuccess) {
        setReceipt({ reference: created.reference_number, name });
      } else if (onSuccess) {
        onSuccess(created.reference_number, name);
      } else {
        router.push(`/assistance/success?ref=${encodeURIComponent(created.reference_number)}`);
      }
    } catch (err) {
      // Failure keeps every field intact so the user can retry.
      if (err instanceof ApiError) setSubmitError(`${err.message} (ref: ${err.requestId})`);
      else setSubmitError("We couldn't submit your request right now. Your details are preserved — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = "field min-h-[52px] text-[16px] md:text-[15px]";
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-red-600" role="alert">{errors[k]}</p>;

  if (receipt) {
    return (
      <div className="py-4 text-center" role="status" aria-live="polite">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-700" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-semibold text-ink-900">
          Thanks {receipt.name}! A customer representative will contact you shortly.
        </h3>
        <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-ink-100 bg-cream-100 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Reference Number</p>
          <p className="mt-1 font-mono text-xl font-bold tracking-wide text-text">{receipt.reference}</p>
        </div>
        <Link
          href={`/assistance/track?ref=${encodeURIComponent(receipt.reference)}`}
          className="btn-ghost mt-5 inline-flex min-h-[48px]"
        >
          Track My Enquiry
        </Link>
        <p className="mt-3 text-xs text-ink-400">This is a request for assistance — not a confirmed booking.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {summary && summary.length > 0 && (
        <div className="rounded-2xl border border-ink-100 bg-cream-50 px-5 py-4" aria-label="Your selected details">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Your selected details</p>
          <dl className="mt-2 space-y-1.5">
            {summary.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 text-sm">
                <dt className="shrink-0 text-ink-500">{row.label}</dt>
                <dd className="text-right font-medium text-ink-900">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-ink-400">You can adjust dates, travellers and notes below.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="input-label" htmlFor="eq-name">Full Name *</label>
          <input id="eq-name" className={field} value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} placeholder="Aarav Sharma" autoComplete="name" />
          {err("customer_name")}
        </div>
        <div>
          <label className="input-label" htmlFor="eq-phone">Mobile Number *</label>
          <input id="eq-phone" className={field} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" inputMode="tel" autoComplete="tel" />
          {err("phone")}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="input-label" htmlFor="eq-email">Email (optional)</label>
          <input id="eq-email" type="email" className={field} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
          {err("email")}
        </div>
        <div>
          <label className="input-label" htmlFor="eq-contact-time">Preferred Contact Time (optional)</label>
          <input id="eq-contact-time" className={field} value={form.preferred_contact_time} onChange={(e) => set("preferred_contact_time", e.target.value)} placeholder="Evenings after 7pm" autoComplete="off" />
        </div>
      </div>
      {/* Honeypot: hidden from real users; bots fill it. Never logged. */}
      <div className="absolute h-px w-px overflow-hidden" aria-hidden="true" style={{ clipPath: "inset(50%)" }}>
        <label htmlFor="eq-website">Website</label>
        <input
          id="eq-website"
          name="website"
          type="text"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="input-label" htmlFor="eq-origin">Origin</label>
          <input id="eq-origin" className={field} value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Kolkata" autoComplete="off" />
        </div>
        <div>
          <label className="input-label" htmlFor="eq-dest">Destination</label>
          <input id="eq-dest" className={field} value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Gangtok" autoComplete="off" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="input-label" htmlFor="eq-start">Travel Date</label>
          <input id="eq-start" type="date" className={field} value={form.travel_start_date} onChange={(e) => set("travel_start_date", e.target.value)} />
        </div>
        <div>
          <label className="input-label" htmlFor="eq-end">Return Date</label>
          <input id="eq-end" type="date" className={field} value={form.travel_end_date} onChange={(e) => set("travel_end_date", e.target.value)} min={form.travel_start_date || undefined} />
          {err("travel_end_date")}
        </div>
        <div>
          <label className="input-label" htmlFor="eq-trav">Travellers</label>
          <input id="eq-trav" type="number" min={1} max={50} className={field} value={form.traveller_count} onChange={(e) => set("traveller_count", Number(e.target.value))} />
          {err("traveller_count")}
        </div>
      </div>
      <div>
        <label className="input-label" htmlFor="eq-req">Special Requirements</label>
        <textarea id="eq-req" className={cn(field, "min-h-[96px]")} value={form.special_requirements} onChange={(e) => set("special_requirements", e.target.value)} placeholder="Couple travelling to Sikkim for 6 days. Prefer a comfortable hotel and private cab. Budget around ₹50,000." rows={3} />
      </div>
      <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 rounded border-ink-300 accent-saffron-600"
        />
        <span>
          I agree to be contacted regarding this enquiry. By submitting this request, you agree that Tripifi CGR may
          contact you regarding your travel enquiry and booking request.
        </span>
      </label>
      {err("consent")}
      {submitError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}
      <button type="submit" disabled={submitting} className="btn-primary min-h-[52px] w-full justify-center disabled:opacity-60">
        {submitting ? "Submitting…" : "Request Booking Assistance"}
      </button>
    </form>
  );
}
