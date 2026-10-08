"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

/** Honest price display: unknown prices render as "Price on request", never ₹0. */
export function PriceText({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null) {
    return <span className={cn("opacity-70", className)}>Price on request</span>;
  }
  return <span className={className}>{formatCurrency(value)}</span>;
}
