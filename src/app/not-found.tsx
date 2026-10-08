import Link from "next/link";
import { Compass, Home, Sparkles, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="journey-loader-plane mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06]"
        aria-hidden="true"
      >
        <Compass className="h-8 w-8 text-[#FFB454]" />
      </div>
      <p className="micro-meta text-[11px] uppercase text-[#FFB454]">
        Off the map
      </p>
      <h1 className="mt-2 font-display text-display-lg font-semibold tracking-tight text-[#F5F7FF]">
        This trail doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#F5F7FF]/70">
        The page you&apos;re looking for wandered off — like a good traveller.
        Let&apos;s get you back on the journey.
      </p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row">
        <Link
          href="/"
          className="journey-press journey-cta-glow inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFB454] px-5 text-sm font-semibold text-[#0B1026]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back home
        </Link>
        <Link
          href="/destinations"
          className="journey-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-[#F5F7FF]"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Explore places
        </Link>
        <Link
          href="/plan"
          className="journey-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-[#F5F7FF]"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Plan a trip
        </Link>
      </div>
    </div>
  );
}
