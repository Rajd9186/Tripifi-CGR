"use client";

import { useState } from "react";
import { enquiriesApi } from "@/lib/api/enquiries";
import { ApiError } from "@/lib/api/client";
import type { EnquiryReceipt } from "@/lib/api/types";

const STEPS = ["Request received", "Assigned to travel representative", "Availability checking", "Quote preparation", "Confirmation"];

export default function TrackClient({ initialRef }: { initialRef?: string }) {
  const [ref, setRef] = useState(initialRef ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<EnquiryReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!ref.trim() || !phone.trim()) {
      setError("Enter your reference number and mobile number.");
      return;
    }
    setLoading(true);
    try {
      setResult(await enquiriesApi.lookup(ref.trim(), phone.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't find that enquiry. Check the reference and phone number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="micro-meta text-[11px] text-ink-400">MY REQUESTS</p>
      <h1 className="fluid-section mt-1 font-display font-semibold text-ink-900">Track your enquiry</h1>
      <form onSubmit={lookup} className="card mt-6 space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="input-label" htmlFor="trk-ref">Reference Number</label>
            <input id="trk-ref" className="field min-h-[52px]" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="TFC-2026-000001" autoComplete="off" />
          </div>
          <div>
            <label className="input-label" htmlFor="trk-phone">Mobile Number</label>
            <input id="trk-phone" className="field min-h-[52px]" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" inputMode="tel" autoComplete="tel" />
          </div>
        </div>
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <button type="submit" disabled={loading} className="btn-navy min-h-[52px] w-full justify-center disabled:opacity-60">
          {loading ? "Checking…" : "Check Status"}
        </button>
      </form>

      {result && (
        <div className="card mt-4 p-5 sm:p-6 animate-scale-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-lg font-bold text-text">{result.reference_number}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-saffron-700">
              {result.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-600">
            {result.origin ?? "—"} → {result.destination ?? "—"} · {result.traveller_count} traveller(s)
          </p>
          <ol className="mt-5 space-y-0">
            {STEPS.map((s, i) => {
              const done = i < 2; // receipt + assignment are system-guaranteed
              return (
                <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < STEPS.length - 1 && <span className="absolute left-[13px] top-7 h-full w-px bg-ink-100" aria-hidden="true" />}
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-leaf-600 text-white" : "bg-ink-100 text-ink-400"}`} aria-hidden="true">
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={`pt-1 text-sm ${done ? "font-medium text-ink-900" : "text-ink-500"}`}>{s}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs text-ink-400">Our travel team is reviewing your request. Timeline updates as they work on it.</p>
        </div>
      )}
    </div>
  );
}
