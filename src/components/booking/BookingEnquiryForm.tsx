"use client";

import { useMemo, useState } from "react";
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

export default function BookingEnquiryForm({
  type,
  prefill,
  tripSnapshot,
  onSuccess,
}: {
  type: EnquiryType;
  prefill?: Partial<BookingEnquiry>;
  tripSnapshot?: Record<string, unknown>;
  onSuccess?: (reference: string) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    customer_name: prefill?.customer_name ?? "",
    phone: prefill?.phone ?? "",
    email: prefill?.email ?? "",
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

  const set = (k: keyof typeof form, v: string | number | boolean | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.customer_name.trim().length < 2) e.customer_name = "Full name is required.";
    if (!PHONE_RE.test(form.phone.trim()) && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      e.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()) && form.email.trim()) e.email = "Enter a valid email address.";
    if (form.travel_start_date && form.travel_end_date && form.travel_end_date < form.travel_start_date) {
      e.travel_end_date = "Return date must be on or after the travel date.";
    }
    if (form.traveller_count < 1) e.traveller_count = "At least 1 traveller is required.";
    if (!form.consent) e.consent = "Please agree to be contacted about this enquiry.";
    return e;
  }, [form]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors(valid);
    setSubmitError(null);
    if (Object.keys(valid).length > 0) return;
    setSubmitting(true);
    track("fallback_started", { type });
    try {
      const receipt = await enquiriesApi.create(
        {
          type,
          customer_name: form.customer_name.trim(),
          phone: normalizePhoneClient(form.phone),
          email: form.email.trim().toLowerCase(),
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
        newIdempotencyKey()
      );
      if (onSuccess) onSuccess(receipt.reference_number);
      else router.push(`/assistance/success?ref=${encodeURIComponent(receipt.reference_number)}`);
      track("fallback_completed", { type, reference: receipt.reference_number });
    } catch (err) {
      if (err instanceof ApiError) setSubmitError(`${err.message} (ref: ${err.requestId})`);
      else setSubmitError("We couldn't submit your request right now. Your details are preserved — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = "field min-h-[52px] text-[16px] md:text-[15px]";
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-red-600" role="alert">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
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
      <div>
        <label className="input-label" htmlFor="eq-email">Email *</label>
        <input id="eq-email" type="email" className={field} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
        {err("email")}
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
