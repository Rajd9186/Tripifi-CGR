"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminEnquiriesApi, listLocalEnquiries } from "@/lib/api/enquiries";
import { isBackendConfigured } from "@/lib/api/client";
import ProviderStatusBadge from "@/components/booking/ProviderStatusBadge";
import { geoApi } from "@/lib/api/geo";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "AWAITING_CUSTOMER", "CONFIRMED", "CLOSED", "CANCELLED"];

export default function AdminEnquiriesPage() {
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [list, h] = await Promise.all([
          adminEnquiriesApi.list(status || undefined).catch(() => []),
          geoApi.providersHealth().catch(() => ({ providers: [] })),
        ]);
        const rows = Array.isArray(list) ? list : [];
        // Local prototype queue so enquiries submitted on-device are reviewable.
        const local = isBackendConfigured()
          ? []
          : listLocalEnquiries()
              .filter((e) => !status || e.status === status)
              .map((e) => ({ ...e, id: e.reference_number, _local: true }));
        setRows([...local, ...rows]);
        setHealth((h as { providers?: unknown }).providers as never[] ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="micro-meta text-[11px] text-ink-400">ADMIN · TRAVEL OPERATIONS</p>
      <h1 className="fluid-section mt-1 font-display font-semibold text-ink-900">Enquiries</h1>
      {!isBackendConfigured() && (
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Prototype queue — enquiries submitted on this device appear below. Connect <code>NEXT_PUBLIC_API_URL</code> for the live backend queue.
        </p>
      )}

      <section aria-label="Provider health" className="card mt-4 p-4">
        <h2 className="text-sm font-semibold text-ink-900">Provider Health</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {health.map((p: any) => (
            <span key={p.provider} className="inline-flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2 text-xs">
              <span className="font-semibold capitalize text-ink-900">{p.provider}</span>
              <ProviderStatusBadge state={p.state} label={`${p.mode} · ${p.state}`} />
              {p.bookable && <span className="text-leaf-700">bookable</span>}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Filter by status">
        {["", ...STATUSES].map((s) => (
          <button
            key={s || "all"}
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-4 text-sm font-medium ${status === s ? "border-navy-900 bg-navy-900 text-white" : "border-ink-200 bg-surface text-ink-700"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="hidden grid-cols-[110px_1fr_1fr_120px_130px] gap-3 border-b border-ink-100 bg-ink-50/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500 md:grid">
          <span>Reference</span><span>Customer</span><span>Service</span><span>Travel</span><span>Status</span>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-sm text-ink-500">Loading enquiries…</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-500">No enquiries in this view yet.</p>
        ) : (
          rows.map((r: any) => (
            <Link key={r.id ?? r.reference_number} href={`/admin/enquiries/${r.id ?? r.reference_number}`} className="grid gap-1 border-b border-ink-100 px-5 py-4 transition-colors last:border-0 hover:bg-ink-50/60 md:grid-cols-[110px_1fr_1fr_120px_130px] md:items-center md:gap-3">
              <span className="font-mono text-xs font-bold text-text">{r.reference_number}</span>
              <span className="text-sm text-ink-900">{r.customer_name}</span>
              <span className="text-sm text-ink-600">{r.type} · {r.destination ?? "—"}</span>
              <span className="text-xs text-ink-500">{r.travel_start_date ?? "—"}</span>
              <span><ProviderStatusBadge state={r.status} label={r.status?.replace(/_/g, " ")} /></span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
