"use client";

import { cn } from "@/lib/utils";

const DOT: Record<string, string> = {
  SUCCESS: "bg-leaf-600",
  LIMITED: "bg-amber-500",
  UNAVAILABLE: "bg-red-500",
  NOT_CONFIGURED: "bg-ink-300",
  NO_RESULTS: "bg-amber-500",
  RATE_LIMITED: "bg-amber-500",
};

export default function ProviderStatusBadge({
  state,
  label,
  className,
}: {
  state: string;
  label?: string;
  className?: string;
}) {
  const normalized = state === "Healthy" ? "SUCCESS" : state;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-700",
        className
      )}
      role="status"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[normalized] ?? "bg-ink-300")} aria-hidden="true" />
      {label ?? normalized.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export type SourceMode =
  | "LIVE"
  | "ESTIMATE"
  | "SCHEDULE_ONLY"
  | "DISCOVERY"
  | "ASSISTED"
  | "DEMO"
  | "UNAVAILABLE";

const MODE_META: Record<SourceMode, { label: (source?: string) => string; dot: string }> = {
  LIVE: { label: (s) => (s && s !== "demo" ? `Live · ${s}` : "Live"), dot: "bg-leaf-600" },
  ESTIMATE: { label: () => "Estimate", dot: "bg-amber-500" },
  SCHEDULE_ONLY: { label: () => "Scheduled timetable", dot: "bg-amber-500" },
  DISCOVERY: { label: () => "Discovery", dot: "bg-teal-600" },
  ASSISTED: { label: () => "Needs confirmation", dot: "bg-saffron-500" },
  DEMO: { label: () => "Demo", dot: "bg-ink-300" },
  UNAVAILABLE: { label: () => "Unavailable", dot: "bg-red-500" },
};

export function timeAgo(iso?: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

/** Honest provenance badge for every result list: mode + source + age + refresh. */
export function SourceBadge({
  mode,
  source,
  fetchedAt,
  onRefresh,
  refreshing = false,
  className,
}: {
  mode: SourceMode;
  source?: string;
  fetchedAt?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}) {
  const meta = MODE_META[mode] ?? MODE_META.UNAVAILABLE;
  const age = timeAgo(fetchedAt);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-surface py-1 pl-2.5 pr-1 text-[11px] font-medium text-ink-700",
        className
      )}
      role="status"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label(source)}
      {age && <span className="text-ink-400">· updated {age}</span>}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh results"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 disabled:opacity-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={refreshing ? "animate-spin" : undefined}
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      )}
    </span>
  );
}
