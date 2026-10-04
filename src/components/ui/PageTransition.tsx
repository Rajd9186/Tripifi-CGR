"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "transition-opacity duration-300 ease-out",
        isLoaded ? "opacity-100" : "opacity-0",
        isExiting ? "opacity-0" : "",
        className
      )}
    >
      {!isLoaded ? (
        <PageSkeleton />
      ) : (
        <AnimatePresence>{children}</AnimatePresence>
      )}
    </div>
  );
}

function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-cream-50 animate-skeleton-pulse">
      <HeroSkeleton />
      <BookingCenterSkeleton />
      <AISkeleton />
      <GridSkeleton count={8} columns={4} />
      <GridSkeleton count={6} columns={3} />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0 bg-navy-900" />
    </section>
  );
}

function BookingCenterSkeleton() {
  return (
    <section className="relative -mt-20 sm:-mt-24 z-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 px-4 sm:px-6 py-4">
            <div className="flex flex-wrap gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-6 w-24 bg-ink-200 rounded" />
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={i < 2 ? "lg:col-span-3" : i < 4 ? "lg:col-span-2" : ""}>
                  <div className="h-4 w-20 bg-ink-200 rounded mb-2" />
                  <div className="h-12 bg-ink-200 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AISkeleton() {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="card p-6 sm:p-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="h-8 w-36 bg-ink-200 rounded-full mx-auto" />
            <div className="h-8 w-3/4 mx-auto bg-ink-200 rounded" />
            <div className="h-6 w-full mx-auto max-w-xl bg-ink-200 rounded" />
            <div className="h-16 w-full bg-ink-200 rounded-xl" />
            <div className="flex flex-wrap justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-32 bg-ink-200 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: number }) {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-ink-200 rounded-full" />
          ))}
        </div>
        <div className={cn("grid gap-4", `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`)}>
          {[...Array(count)].map((_, i) => (
            <DestinationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DestinationCardSkeleton() {
  return (
    <div className="card group flex flex-col overflow-hidden">
      <div className="relative h-56 bg-ink-200" />
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="h-8 w-3/4 bg-ink-200 rounded" />
        <div className="h-4 w-1/2 bg-ink-200 rounded" />
        <div className="h-3 w-full bg-ink-200 rounded" />
        <div className="h-3 w-5/6 bg-ink-200 rounded" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-ink-200 rounded-full" />
          <div className="h-6 w-24 bg-ink-200 rounded-full" />
          <div className="h-6 w-28 bg-ink-200 rounded-full" />
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="h-5 w-24 bg-ink-200 rounded" />
          <div className="h-10 w-24 bg-ink-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}