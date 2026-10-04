import Link from "next/link";
import type { Destination } from "@/lib/destinations";

interface DestinationCardProps {
  destination: Destination;
  variant?: "default" | "large" | "compact";
}

export default function DestinationCard({
  destination,
  variant = "default",
}: DestinationCardProps) {
  if (variant === "large") {
    return (
      <Link
        href={`/destinations/${destination.slug}`}
        className="group relative overflow-hidden rounded-2xl bg-ink-900 h-[420px] block"
      >
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-xs text-white/80 uppercase tracking-wider mb-2">
            {destination.region}
          </div>
          <h3 className="font-display text-3xl font-semibold text-white">
            {destination.name}
          </h3>
          <p className="text-base text-white/90 mt-2 max-w-xl line-clamp-2">
            {destination.tagline}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Best time: {destination.bestTime}
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              {destination.idealDuration}
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              {destination.estimatedBudget}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/destinations/${destination.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-2 transition hover:border-navy-200 hover:shadow-sm"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink-900">
            {destination.name}
          </h3>
          <p className="truncate text-xs text-ink-600">{destination.state}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="card group flex flex-col overflow-hidden"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-medium text-ink-900 shadow-sm backdrop-blur">
            {destination.region}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-semibold text-ink-900">
          {destination.name}
        </h3>
        <p className="text-sm text-ink-600 mt-1 line-clamp-2">
          {destination.tagline}
        </p>
        <div className="mt-3 text-xs text-ink-600">{destination.bestTime}</div>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="text-sm text-ink-600">{destination.idealDuration}</div>
          <span className="text-xs font-medium text-navy-900 group-hover:underline">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}
