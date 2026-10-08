"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, MessagesSquare } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center" role="alert">
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#FF6B6B]/25 bg-[#FF6B6B]/10"
        aria-hidden="true"
      >
        <AlertTriangle className="h-8 w-8 text-[#FF6B6B]" />
      </div>
      <p className="micro-meta text-[11px] uppercase text-[#FFB454]">
        Turbulence ahead
      </p>
      <h1 className="mt-2 font-display text-display-md font-semibold tracking-tight text-[#F5F7FF]">
        Something went off-route
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#F5F7FF]/70">
        {error.message ||
          "We hit an unexpected bump. Your trip plans are safe — try again or let our team help."}
      </p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="journey-press journey-cta-glow inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFB454] px-5 text-sm font-semibold text-[#0B1026]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/assistance"
          className="journey-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-[#F5F7FF]"
        >
          <MessagesSquare className="h-4 w-4" aria-hidden="true" />
          Get human help
        </Link>
      </div>
    </div>
  );
}
