"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import BookingEnquiryForm from "@/components/booking/BookingEnquiryForm";
import EnquirySuccess from "@/components/booking/EnquirySuccess";
import { useApp } from "@/lib/store";
import { calculateBudget } from "@/lib/budget";
import { formatINR } from "@/lib/utils";
import { normalizeIndianPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Step = "review" | "travellers" | "addons" | "payment" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "review", label: "Review Trip" },
  { id: "travellers", label: "Travellers" },
  { id: "addons", label: "Add-ons" },
  { id: "payment", label: "Payment" },
];

const ADDONS = [
  { id: "insurance", label: "Travel Insurance (sample)", desc: "Illustrative cover for delays & baggage.", price: 499 },
  { id: "baggage", label: "Extra Baggage (sample)", desc: "Additional 10 kg on your outbound flight.", price: 1200 },
  { id: "transfer", label: "Airport Transfer (sample)", desc: "Private pickup on arrival day.", price: 900 },
  { id: "support", label: "Priority Support (sample)", desc: "Faster responses from our travel team.", price: 299 },
];

export default function CheckoutClient() {
  const { currentTrip, ensureDraftTrip } = useApp();
  const [step, setStep] = useState<Step>("review");
  const [travellerNames, setTravellerNames] = useState<string[]>([""]);
  const [travellerPhones, setTravellerPhones] = useState<string[]>([""]);
  const [travellerErrors, setTravellerErrors] = useState<string[]>([]);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [reference, setReference] = useState<string | null>(null);

  const trip = currentTrip ?? null;
  const items = trip?.items ?? [];
  const travellers = trip?.travellers ?? 1;
  const addonsTotal = ADDONS.filter((a) => addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const breakdown = useMemo(() => calculateBudget(items, travellers, addonsTotal), [items, travellers, addonsTotal]);

  const ensureTravellerRows = (count: number) => {
    setTravellerNames((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? ""));
    setTravellerPhones((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? ""));
    setTravellerErrors(Array.from({ length: count }, () => ""));
  };

  const goTravellers = () => {
    const t = trip ?? ensureDraftTrip({});
    void t;
    ensureTravellerRows(trip?.travellers ?? 1);
    setStep("travellers");
  };

  const submitTravellers = () => {
    const errs = travellerNames.map((n, i) => {
      if (!n.trim()) return "Name is required.";
      if (!normalizeIndianPhone(travellerPhones[i] ?? "")) return "Enter a valid 10-digit Indian mobile number.";
      return "";
    });
    setTravellerErrors(errs);
    if (errs.some(Boolean)) return;
    setStep("addons");
  };

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (step === "done" && reference) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <EnquirySuccess reference={reference} />
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/trips" className="btn-navy min-h-[48px]">View My Trip</Link>
          <Link href="/" className="btn-ghost min-h-[48px]">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="micro-meta text-[11px] text-white/50">CHECKOUT · TRIPIFI CGR</p>
          <h1 className="fluid-section mt-1 font-display font-semibold text-white">Checkout</h1>
          <div className="mt-4 flex flex-wrap gap-2" role="list" aria-label="Checkout steps">
            {STEPS.map((s, i) => {
              const active = s.id === step;
              const done = STEPS.findIndex((x) => x.id === step) > i;
              return (
                <span key={s.id} role="listitem" className={cn("inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-medium", active ? "border-saffron-500 bg-saffron-500 text-[#10161C]" : done ? "border-leaf-600 bg-leaf-600 text-[#10161C]" : "border-white/20 text-white/70")}>
                  {done ? "✓ " : `${i + 1}. `}{s.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {step === "review" && (
              <Card title="Review Trip">
                {items.length === 0 ? (
                  <div className="text-sm text-ink-600">
                    Your trip is empty. <Link href="/plan" className="font-medium text-saffron-600 underline">Build your trip first</Link>.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-ink-100 px-3 py-2.5 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium text-ink-900 truncate">{item.title}</div>
                          <div className="text-xs text-ink-500">{item.type}{item.date ? ` · ${item.date}` : ""}</div>
                        </div>
                        <span className="tabular-nums text-ink-900">{formatINR(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button onClick={goTravellers} disabled={items.length === 0} className="btn-primary mt-4 min-h-[52px] w-full justify-center disabled:opacity-50">
                  Continue to Travellers
                </button>
              </Card>
            )}

            {step === "travellers" && (
              <Card title="Traveller Details">
                <div className="space-y-4">
                  {travellerNames.map((_, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-ink-100 p-3">
                      <div>
                        <label className="input-label" htmlFor={`tv-name-${i}`}>Traveller {i + 1} · Full Name *</label>
                        <input
                          id={`tv-name-${i}`}
                          className="field min-h-[52px]"
                          value={travellerNames[i] ?? ""}
                          onChange={(e) => setTravellerNames((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                          autoComplete="off"
                        />
                        {travellerErrors[i] && !travellerNames[i]?.trim() && <p role="alert" className="mt-1 text-xs text-red-600">{travellerErrors[i]}</p>}
                      </div>
                      <div>
                        <label className="input-label" htmlFor={`tv-phone-${i}`}>Phone *</label>
                        <input
                          id={`tv-phone-${i}`}
                          className="field min-h-[52px]"
                          value={travellerPhones[i] ?? ""}
                          onChange={(e) => setTravellerPhones((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                          inputMode="tel"
                          autoComplete="tel"
                        />
                        {travellerErrors[i] && travellerNames[i]?.trim() && <p role="alert" className="mt-1 text-xs text-red-600">{travellerErrors[i]}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setStep("review")} className="btn-ghost min-h-[52px] flex-1 justify-center">Back</button>
                  <button onClick={submitTravellers} className="btn-primary min-h-[52px] flex-1 justify-center">Continue to Add-ons</button>
                </div>
              </Card>
            )}

            {step === "addons" && (
              <Card title="Add-ons">
                <p className="mb-3 text-xs text-ink-500">Sample add-ons for illustration — included in your enquiry, never charged automatically.</p>
                <div className="space-y-2">
                  {ADDONS.map((a) => (
                    <label key={a.id} className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border border-ink-200 px-3">
                      <input type="checkbox" checked={addonIds.includes(a.id)} onChange={() => toggleAddon(a.id)} className="h-5 w-5 accent-saffron-600" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-ink-900">{a.label}</span>
                        <span className="block text-xs text-ink-500">{a.desc}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">+{formatINR(a.price)}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setStep("travellers")} className="btn-ghost min-h-[52px] flex-1 justify-center">Back</button>
                  <button onClick={() => setStep("payment")} className="btn-primary min-h-[52px] flex-1 justify-center">Continue to Payment</button>
                </div>
              </Card>
            )}

            {step === "payment" && (
              <div className="space-y-4">
                <Card title="Payment">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Live payment isn&apos;t available for these services yet — no money will be taken. Share your details and our travel team will arrange your booking.
                  </div>
                  <div className="mt-4 space-y-2" aria-label="Future payment methods (unavailable)">
                    {["UPI", "Credit/Debit Card", "Net Banking", "Wallet", "EMI"].map((m) => (
                      <div key={m} className="flex items-center gap-2 rounded-lg border border-ink-100 bg-ink-50/50 p-3 text-sm text-ink-400">
                        <span className="font-medium">{m}</span>
                        <Badge variant="default">Coming soon</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-ink-400">We never store card numbers or CVV. Payment architecture is ready for a future provider integration.</p>
                </Card>

                <Card title="Request Booking Assistance">
                  <BookingEnquiryForm
                    type="MULTI_SERVICE"
                    prefill={{
                      customer_name: travellerNames[0] ?? "",
                      phone: travellerPhones[0] ?? "",
                      origin: trip?.origin,
                      destination: trip?.destinations.join(", "),
                      travel_start_date: trip?.startDate,
                      travel_end_date: trip?.endDate,
                      traveller_count: travellers,
                      budget: trip?.budget,
                    }}
                    tripSnapshot={{
                      trip: trip?.name,
                      items: items.map((i) => ({ type: i.type, title: i.title, amount: i.amount })),
                      budget: breakdown,
                      addons: ADDONS.filter((a) => addonIds.includes(a.id)).map((a) => a.label),
                      travellers: travellerNames,
                    }}
                    onSuccess={(ref) => {
                      setReference(ref);
                      setStep("done");
                    }}
                  />
                </Card>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <Card title="Order Summary">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-ink-600">Subtotal</span><span className="tabular-nums">{formatINR(breakdown.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-ink-600">Taxes (5%)</span><span className="tabular-nums">{formatINR(breakdown.taxes)}</span></div>
                {addonsTotal > 0 && <div className="flex justify-between"><span className="text-ink-600">Add-ons (sample)</span><span className="tabular-nums">{formatINR(addonsTotal)}</span></div>}
                <div className="border-t border-ink-100 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg tabular-nums">{formatINR(breakdown.total)}</span>
                </div>
                <div className="flex justify-between text-ink-600"><span>Per traveller</span><span className="tabular-nums">{formatINR(breakdown.perTraveller)}</span></div>
              </div>
              <p className="mt-2 text-[11px] text-ink-400">Server-style pricing preview. Final quote confirmed by our travel team.</p>
            </Card>
          </div>
        </div>
      </section>

      <div className="sticky bottom-[96px] mt-6 px-4 md:hidden">
        <div className="card flex items-center justify-between gap-3 p-4 safe-bottom">
          <div>
            <div className="text-xs text-ink-500">TOTAL</div>
            <div className="text-xl font-semibold tabular-nums">{formatINR(breakdown.total)}</div>
          </div>
          <button
            onClick={() => {
              if (step === "review") goTravellers();
              else if (step === "travellers") submitTravellers();
              else if (step === "addons") setStep("payment");
            }}
            className="btn-primary min-h-[52px] px-6"
            disabled={step !== "review" && step !== "travellers" && step !== "addons"}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
