import { RouteVisualization } from "@/components/graphics/RouteVisualization";

export default function TripEnquirySummary({
  origin,
  stops,
  days,
  travellers,
  budget,
}: {
  origin: string;
  stops: string[];
  days: number;
  travellers: number;
  budget: number;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-surface p-5">
      <p className="micro-meta text-[10px] text-ink-400">TRIP SUMMARY · INCLUDED IN ENQUIRY</p>
      <div className="mt-3 space-y-2.5">
        <RouteVisualization from={origin} to={stops[0] ?? origin} variant="light" />
        {stops.slice(1).map((s, i) => (
          <RouteVisualization key={s} from={stops[i] ?? origin} to={s} variant="light" />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] text-ink-500">
        <span className="rounded-lg bg-ink-50 px-2.5 py-1">{days} DAYS</span>
        <span className="rounded-lg bg-ink-50 px-2.5 py-1">{travellers} TRAVELLERS</span>
        <span className="rounded-lg bg-saffron-50 px-2.5 py-1 text-saffron-700">₹{budget.toLocaleString("en-IN")} EST.</span>
      </div>
    </div>
  );
}
