"use client";

import { cn } from "@/lib/utils";

export function DataChip({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "saffron" | "teal" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
        variant === "default" && "bg-ink-50 text-ink-600 border border-ink-100",
        variant === "saffron" && "bg-saffron-50 text-saffron-700 border border-saffron-200",
        variant === "teal" && "bg-teal-50 text-teal-700 border border-teal-200",
        variant === "dark" && "bg-navy-900/80 text-white/90 border border-white/10",
        className
      )}
    >
      {children}
    </span>
  );
}

export function TravelNode({
  active = false,
  variant = "default",
  className,
}: {
  active?: boolean;
  variant?: "default" | "saffron" | "teal";
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex h-3 w-3 shrink-0", className)} aria-hidden="true">
      {active && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            variant === "saffron" && "bg-saffron-400",
            variant === "teal" && "bg-teal-400",
            variant === "default" && "bg-surface"
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-3 w-3 rounded-full border-2",
          variant === "saffron" && "border-saffron-500 bg-saffron-400",
          variant === "teal" && "border-teal-500 bg-teal-400",
          variant === "default" && "border-white bg-bg-elevated/90"
        )}
      />
    </span>
  );
}

export function RouteVisualization({
  from,
  to,
  meta,
  variant = "light",
  className,
}: {
  from: string;
  to: string;
  meta?: string;
  variant?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="img"
      aria-label={`Route from ${from} to ${to}${meta ? `, ${meta}` : ""}`}
    >
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-widest",
          variant === "light" ? "text-ink-900" : "text-white"
        )}
      >
        {from}
      </span>
      <span className="relative flex flex-1 items-center" aria-hidden="true">
        <span className={cn("h-px w-full", variant === "light" ? "bg-ink-200" : "bg-white/25")} />
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <TravelNode variant="saffron" />
        </span>
        <svg
          className={cn("absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2", variant === "light" ? "text-saffron-500" : "text-saffron-300")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
        <span className="absolute right-0 top-1/2 -translate-y-1/2">
          <TravelNode variant="teal" active />
        </span>
        {meta && (
          <span
            className={cn(
              "absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-wider",
              variant === "light" ? "text-ink-400" : "text-white/60"
            )}
          >
            {meta}
          </span>
        )}
      </span>
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-widest",
          variant === "light" ? "text-ink-900" : "text-white"
        )}
      >
        {to}
      </span>
    </div>
  );
}
