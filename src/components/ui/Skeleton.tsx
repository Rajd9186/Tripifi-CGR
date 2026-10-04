import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card" | "hero" | "list";
  width?: string;
  height?: string;
  lines?: number;
}

export function Skeleton({ className, variant = "text", width, height, lines = 1 }: SkeletonProps) {
  const baseClasses = "animate-skeleton-pulse bg-ink-200 rounded";

  const variants = {
    text: cn(baseClasses, "h-4 w-full"),
    circular: cn(baseClasses, "rounded-full"),
    rectangular: cn(baseClasses, "rounded-lg"),
    card: cn(baseClasses, "rounded-xl"),
    hero: cn(baseClasses, "rounded-2xl"),
    list: cn(baseClasses, "h-20 rounded-xl"),
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-3", className)} style={{ width }}>
        {[...Array(lines)].map((_, i) => (
          <div
            key={i}
            className={cn(variants.text, i === lines - 1 && "w-3/4")}
            style={{ height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(variants[variant], className)}
      style={{ width, height }}
    />
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0 bg-navy-900 animate-skeleton-pulse" />
      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center">
        <div className="max-w-4xl space-y-6 animate-skeleton-pulse">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-12 w-full lg:w-5/6" />
          <Skeleton className="h-8 w-full lg:w-3/4" />
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-5 w-44 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function BookingCenterSkeleton() {
  return (
    <section className="relative -mt-20 sm:-mt-24 z-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="card overflow-hidden animate-skeleton-pulse">
          <div className="border-b border-ink-100 px-4 sm:px-6 py-4">
            <div className="flex flex-wrap gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-24 rounded" />
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4 animate-skeleton-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={i < 2 ? "lg:col-span-3" : i < 4 ? "lg:col-span-2" : ""}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AISkeleton() {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="card p-6 sm:p-8 animate-skeleton-pulse">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-8 w-36 rounded-full mx-auto" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full mx-auto max-w-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="flex flex-wrap justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-32 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="card group flex flex-col overflow-hidden animate-skeleton-pulse">
      <div className="relative h-56 bg-ink-200" />
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PackageCardSkeleton() {
  return (
    <div className="card group flex flex-col overflow-hidden animate-skeleton-pulse">
      <div className="relative h-48 bg-ink-200" />
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
        </div>
        <ul className="space-y-2 flex-1">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-full" />
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4 border-t border-ink-100 flex items-end justify-between">
          <div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TripBuilderSkeleton() {
  return (
    <div className="hidden lg:grid lg:grid-cols-12 gap-4 h-[calc(100vh-180px)] animate-skeleton-pulse">
      <div className="lg:col-span-3">
        <div className="card h-full flex flex-col">
          <div className="border-b border-ink-100 px-4 sm:px-5 py-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-32 mt-1" />
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-ink-100 rounded-xl p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="border-t border-ink-100 p-4">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-6">
        <div className="card h-full">
          <div className="border-b border-ink-100 px-4 sm:px-5 py-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-40 mt-1" />
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-5 w-40 mx-auto text-center mb-2" />
            <Skeleton className="h-4 w-56 mx-auto text-center mb-4" />
            <div className="flex flex-wrap justify-center gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className="card h-full flex flex-col">
          <div className="border-b border-ink-100 px-4 sm:px-5 py-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-28 mt-1" />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="h-48 bg-ink-100 rounded-none" />
            <div className="flex-1 p-4 space-y-3">
              <Skeleton className="h-5 w-16" />
              <div className="space-y-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-20 text-right" />
                  </div>
                ))}
              </div>
              <div className="border-t border-ink-100 pt-2 mt-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-24 text-right" />
                </div>
              </div>
            </div>
            <div className="border-t border-ink-100 p-4 space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DestinationPageSkeleton() {
  return (
    <div className="pb-16 animate-skeleton-pulse">
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-navy-900" />
      </section>
      <section className="px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="max-w-8xl mx-auto">
          <div className="card p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6 sm:p-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5">
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function PackagePageSkeleton() {
  return (
    <div className="pb-16 animate-skeleton-pulse">
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-navy-900" />
      </section>
      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-8xl mx-auto">
          <div className="card p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-8 w-2/3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card p-6 sm:p-8">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Skeleton className="h-4 w-4 rounded mt-0.5" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="card p-5">
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function GridSkeleton({ count = 6, columns = 4 }: { count?: number; columns?: number }) {
  return (
    <div className={cn("grid gap-4", `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`)}>
      {[...Array(count)].map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
    </div>
  );
}