import { Plane } from "lucide-react";

export default function AppLoading() {
  return (
    <div
      className="mx-auto flex min-h-[60vh] max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8"
      aria-label="Loading"
      role="status"
    >
      <div className="flex items-center gap-3 text-[#F5F7FF]/70">
        <span className="journey-loader-plane flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
          <Plane className="h-5 w-5 text-[#FFB454]" aria-hidden="true" />
        </span>
        <p className="text-sm">Charting your course…</p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
          >
            <div className="journey-skeleton h-44" />
            <div className="space-y-3 p-4">
              <div className="journey-skeleton h-5 w-3/4 rounded-lg" />
              <div className="journey-skeleton h-4 w-1/2 rounded-lg" />
              <div className="journey-skeleton h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
