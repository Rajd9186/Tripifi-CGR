"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { findDestination } from "@/lib/destinations";

interface JourneyCity {
  name: string;
  slug?: string;
  x: number;
  y: number;
}

const CITIES: JourneyCity[] = [
  { name: "Delhi", x: 450, y: 120 },
  { name: "Jaipur", slug: "rajasthan", x: 380, y: 190 },
  { name: "Varanasi", slug: "uttarakhand", x: 560, y: 210 },
  { name: "Kolkata", slug: "west-bengal", x: 660, y: 280 },
  { name: "Mumbai", x: 250, y: 320 },
  { name: "Goa", slug: "goa", x: 280, y: 390 },
  { name: "Chennai", slug: "tamil-nadu", x: 480, y: 400 },
  { name: "Kerala", slug: "kerala", x: 380, y: 450 },
];

const ROUTE_D =
  "M 450 120 C 420 150, 400 170, 380 190 S 480 200, 560 210 S 620 250, 660 280 S 400 300, 250 320 S 270 360, 280 390 S 400 395, 480 400 S 420 430, 380 450";

/**
 * JourneyMap — the route map lives ONLY inside this bounded section.
 * Path draws itself on scroll into view; pins pop in sequentially.
 * Tapping a city opens a details sheet. No overlap with other content.
 */
export default function JourneyMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [selected, setSelected] = useState<JourneyCity | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    if (!section || !path) return;
    if (reducedMotion) {
      setDrawn(true);
      return;
    }
    let observer: IntersectionObserver | null = null;
    try {
      const len = path.getTotalLength();
      path.style.setProperty("--journey-draw-len", `${len}`);
    } catch {
      /* noop */
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDrawn(true);
            observer?.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => observer?.disconnect();
  }, [reducedMotion]);

  const selectedDestination = selected?.slug
    ? findDestination(selected.slug)
    : undefined;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="journey-map-title"
      className="journey-map-frame relative mx-4 mt-4 rounded-3xl border border-white/10 bg-[#0B1026]/90 px-4 py-8 backdrop-blur-xl sm:mx-6 sm:px-6 lg:mx-8"
    >
      <div className="mx-auto max-w-6xl">
        <p className="micro-meta text-[11px] uppercase text-[#FFB454]">
          Signature circuits
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2
            id="journey-map-title"
            className="font-display text-display-md font-semibold tracking-tight text-[#F5F7FF]"
          >
            One country, a thousand journeys
          </h2>
          <Link
            href="/destinations"
            className="journey-press inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-[#F5F7FF]"
          >
            <MapPin className="h-4 w-4 text-[#FFB454]" aria-hidden="true" />
            Explore all places
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F5F7FF]/70">
          Follow the golden-hour trail across India — tap any city to see where
          it can take you.
        </p>

        <div className="relative mt-6">
          <svg
            viewBox="0 0 800 500"
            className="h-auto w-full"
            role="img"
            aria-label="Illustrated travel route connecting major Indian cities"
          >
            <defs>
              <linearGradient id="journey-route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#19C3B2" />
                <stop offset="55%" stopColor="#FFB454" />
                <stop offset="100%" stopColor="#FF6B6B" />
              </linearGradient>
            </defs>

            {/* Dashed flight path */}
            <path
              ref={pathRef}
              d={ROUTE_D}
              fill="none"
              stroke="url(#journey-route-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={cn(
                "journey-route-path",
                drawn && "is-drawing",
                reducedMotion && "is-drawing"
              )}
              style={reducedMotion ? { animation: "none", strokeDashoffset: 0 } : undefined}
              opacity="0.9"
            />

            {/* City pins */}
            {CITIES.map((city, i) => (
              <g key={city.name}>
                <circle
                  cx={city.x}
                  cy={city.y}
                  r="14"
                  fill="none"
                  stroke="#FFB454"
                  strokeWidth="1.5"
                  className={cn("journey-ripple", drawn && "is-visible")}
                  style={{ animationDelay: `${0.3 + i * 0.15}s` }}
                />
                <g
                  className={cn("journey-pin", drawn && "is-visible")}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <circle cx={city.x} cy={city.y} r="7" fill="#0B1026" stroke="#FFB454" strokeWidth="2" />
                  <circle cx={city.x} cy={city.y} r="2.5" fill="#FFB454" />
                  <text
                    x={city.x}
                    y={city.y - 16}
                    textAnchor="middle"
                    fill="#F5F7FF"
                    fontSize="15"
                    fontWeight="600"
                    style={{ paintOrder: "stroke", stroke: "#0B1026", strokeWidth: 4 }}
                  >
                    {city.name}
                  </text>
                  {/* Large tap target */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="26"
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setSelected(city)}
                  >
                    <title>{`${city.name} — view details`}</title>
                  </circle>
                </g>
              </g>
            ))}

            {/* Plane marker at route start */}
            <g
              className={cn("journey-pin", drawn && "is-visible")}
              style={{ animationDelay: "0s" }}
              transform="translate(450 120)"
            >
              <circle r="13" fill="#FFB454" opacity="0.25" />
              <path
                d="M-7 1 L7 1 M0 -7 L0 7 M-4 -4 L4 4 M-4 4 L4 -4"
                stroke="#FFB454"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </svg>
          <p className="mt-2 text-center text-xs text-[#F5F7FF]/50">
            Illustrated route — tap a city for details
          </p>
        </div>
      </div>

      {/* City details sheet */}
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" size="md" className="mx-auto max-w-2xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FFB454]" aria-hidden="true" />
                  {selected.name}
                </SheetTitle>
                <SheetDescription>
                  {selectedDestination
                    ? selectedDestination.tagline
                    : "A great starting point for your Indian journey."}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 p-5 pt-0 sm:flex-row">
                <Link
                  href={selected.slug ? `/destinations/${selected.slug}` : "/destinations"}
                  className="journey-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFB454] px-5 text-sm font-semibold text-[#0B1026]"
                >
                  View details
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/plan"
                  className="journey-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-[#F5F7FF]"
                >
                  <Plane className="h-4 w-4" aria-hidden="true" />
                  Plan a trip
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
