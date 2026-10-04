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
        "inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700",
        className
      )}
      role="status"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[normalized] ?? "bg-ink-300")} aria-hidden="true" />
      {label ?? normalized.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
