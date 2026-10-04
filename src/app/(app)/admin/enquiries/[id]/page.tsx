"use client";

import { useEffect, useState } from "react";
import { adminEnquiriesApi } from "@/lib/api/enquiries";
import { apiRequest } from "@/lib/api/client";
import ProviderStatusBadge from "@/components/booking/ProviderStatusBadge";

const FLOW = ["NEW", "CONTACTED", "QUOTED", "AWAITING_CUSTOMER", "CONFIRMED", "CLOSED"];

export default function AdminEnquiryDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, h, n] = await Promise.all([
        adminEnquiriesApi.get(params.id),
        apiRequest(`/admin/enquiries/${params.id}/history`).catch(() => []),
        apiRequest(`/admin/enquiries/${params.id}/notes`).catch(() => []),
      ]);
      setData(d);
      setHistory(Array.isArray(h) ? h : []);
      setNotes(Array.isArray(n) ? n : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-ink-500">Loading enquiry…</p>;
  if (!data) return <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-ink-500">Enquiry not found.</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="font-mono text-sm font-bold text-navy-900">{data.reference_number}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink-900">{data.customer_name}</h1>
        <ProviderStatusBadge state={data.status} label={data.status?.replace(/_/g, " ")} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Customer</h2>
          <dl className="mt-2 space-y-1 text-sm text-ink-600">
            <div className="flex justify-between gap-3"><dt>Phone</dt><dd className="font-medium text-ink-900">{data.phone}</dd></div>
            <div className="flex justify-between gap-3"><dt>Email</dt><dd className="font-medium text-ink-900">{data.email}</dd></div>
          </dl>
        </section>
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Trip</h2>
          <dl className="mt-2 space-y-1 text-sm text-ink-600">
            <div className="flex justify-between gap-3"><dt>Route</dt><dd className="font-medium text-ink-900">{data.origin ?? "—"} → {data.destination ?? "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Dates</dt><dd className="font-medium text-ink-900">{data.travel_start_date ?? "—"} → {data.travel_end_date ?? "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Travellers</dt><dd className="font-medium text-ink-900">{data.traveller_count}</dd></div>
          </dl>
        </section>
      </div>

      <section className="card mt-4 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Follow-up workflow</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FLOW.map((s) => (
            <button
              key={s}
              onClick={async () => {
                await apiRequest(`/admin/enquiries/${params.id}`, { method: "PATCH", body: JSON.stringify({ status: s }) });
                load();
              }}
              className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-xs font-semibold ${data.status === s ? "border-navy-900 bg-navy-900 text-white" : "border-ink-200 bg-white text-ink-700"}`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Assign to representative" className="field min-h-[48px] flex-1" aria-label="Assign to representative" />
          <button
            onClick={async () => {
              if (!assignee.trim()) return;
              await apiRequest(`/admin/enquiries/${params.id}/assign`, { method: "POST", body: JSON.stringify({ assigned_to: assignee.trim() }) });
              setAssignee("");
              load();
            }}
            className="btn-navy inline-flex min-h-[48px]"
          >
            Assign
          </button>
        </div>
        {data.assigned_to && <p className="mt-2 text-xs text-ink-500">Assigned to {data.assigned_to}</p>}
      </section>

      <section className="card mt-4 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Private notes <span className="font-normal text-ink-400">(never visible to customers)</span></h2>
        <div className="mt-3 space-y-2">
          {notes.map((n: any, i: number) => (
            <div key={i} className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
              <p className="text-[11px] font-semibold text-ink-500">{n.author} · {n.created_at}</p>
              <p className="mt-1">{n.note}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-ink-400">No notes yet.</p>}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Called customer at 4:15 PM…" className="field min-h-[48px] flex-1" aria-label="Add private note" />
          <button
            onClick={async () => {
              if (!note.trim()) return;
              await apiRequest(`/admin/enquiries/${params.id}/notes`, { method: "POST", body: JSON.stringify({ note: note.trim() }) });
              setNote("");
              load();
            }}
            className="btn-ghost inline-flex min-h-[48px]"
          >
            Add note
          </button>
        </div>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="text-sm font-semibold text-ink-900">History</h2>
        <ol className="mt-3 space-y-3">
          {history.map((h: any, i: number) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[11px] font-bold text-navy-900">{i + 1}</span>
              <span className="text-ink-700"><strong>{h.status}</strong> · {h.changed_by ?? "system"}{h.comment ? ` — ${h.comment}` : ""}</span>
            </li>
          ))}
          {history.length === 0 && <li className="text-sm text-ink-400">No transitions yet.</li>}
        </ol>
      </section>
    </div>
  );
}
