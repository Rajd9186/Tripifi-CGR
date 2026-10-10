"use client";

/**
 * Travel-themed loader: bobbing paper plane over a drawing dotted path.
 * Transform/opacity animation only; hidden from assistive tech (pair with a
 * role="status" label where used).
 */
export default function JourneyLoader({ label = "Planning your journey…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <svg width="72" height="28" viewBox="0 0 72 28" fill="none" className="shrink-0">
        <path
          d="M2 20 C 20 20, 30 8, 46 10 S 62 14, 70 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="journey-loader-path text-teal-600 opacity-60"
        />
        <g className="journey-loader-plane">
          <path
            d="M58 3 L66 9 L58 15 L55.5 9 Z"
            fill="currentColor"
            className="text-saffron-600"
          />
        </g>
      </svg>
      <span className="text-xs font-medium text-ink-600">{label}</span>
    </div>
  );
}
