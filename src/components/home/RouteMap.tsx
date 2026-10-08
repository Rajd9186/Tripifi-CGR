"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface City {
  id: string;
  name: string;
  lon: number;
  lat: number;
  /** Which side of the pin the label sits on (keeps labels off the route and off each other). */
  side: "l" | "r";
  /** Existing /destinations/[slug] page, if there is one. */
  slug?: string;
  blurb: string;
}

const W = 360;
const H = 440;
/** Rough lon/lat -> viewBox projection for India. Not cartographic, just recognisable. */
const project = (lon: number, lat: number) => ({
  x: 30 + ((lon - 68) / 30) * 300,
  y: 30 + ((35 - lat) / 27) * 380,
});

const CITIES: City[] = [
  { id: "delhi", name: "Delhi", lon: 77.2, lat: 28.6, side: "r", blurb: "The northern gateway: forts, street food and flights to everywhere." },
  { id: "jaipur", name: "Jaipur", lon: 75.8, lat: 26.9, side: "l", slug: "rajasthan", blurb: "The Pink City: palaces, bazaars and the start of the Rajasthan circuit." },
  { id: "mumbai", name: "Mumbai", lon: 72.8, lat: 19.1, side: "l", blurb: "Sea-link skyline, Marine Drive evenings and the quickest hop to Goa." },
  { id: "goa", name: "Goa", lon: 74.0, lat: 15.5, side: "l", slug: "goa", blurb: "Beaches, shacks and Portuguese lanes, easy any season." },
  { id: "kochi", name: "Kochi", lon: 76.3, lat: 10.0, side: "l", slug: "kerala", blurb: "Gateway to the backwaters, tea hills and Kerala's coast." },
  { id: "chennai", name: "Chennai", lon: 80.3, lat: 13.1, side: "r", blurb: "Temples, filter coffee and the Coromandel coast." },
  { id: "kolkata", name: "Kolkata", lon: 88.4, lat: 22.6, side: "r", blurb: "The City of Joy: colonial boulevards, sweets and the train to Darjeeling and Sikkim." },
  { id: "varanasi", name: "Varanasi", lon: 83.0, lat: 25.3, side: "r", blurb: "Ganga ghats at dawn, one of the oldest living cities on earth." },
];

const ROUTE = ["delhi", "jaipur", "mumbai", "goa", "kochi", "chennai", "kolkata", "varanasi"];

/** Catmull-Rom -> cubic Bezier, so the route curves smoothly through every city. */
function smoothPath(pts: { x: number; y: number }[]): string {
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const byId = Object.fromEntries(CITIES.map((c) => [c.id, c]));
const POINTS = ROUTE.map((id) => project(byId[id].lon, byId[id].lat));
const ROUTE_D = smoothPath(POINTS);

export function RouteMap() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = activeId ? byId[activeId] : null;

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="route-map-title">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Copy + selected city */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-saffron">Across India</p>
          <h2 id="route-map-title" className="font-display text-display-xl font-semibold tracking-tight text-text">
            Your next journey, mapped
          </h2>
          <p className="mt-4 max-w-md text-body-lg text-text-muted">
            Pick a city and we&apos;ll line up flights, trains, stays and cabs around it.
          </p>

          {/* Chip row: keyboard / small-screen friendly alternative to tapping pins */}
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Cities on the route">
            {CITIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                aria-pressed={activeId === c.id}
                className={cn(
                  "min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors",
                  activeId === c.id
                    ? "border-saffron/60 bg-saffron/15 text-saffron"
                    : "border-white/10 bg-white/[0.04] text-text-muted hover:text-text"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-[132px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl" aria-live="polite">
            {active ? (
              <div key={active.id} className="animate-fade-up">
                <div className="flex items-center gap-2 font-display text-lg font-semibold text-text">
                  <MapPin className="h-4 w-4 text-cyan" aria-hidden="true" />
                  {active.name}
                </div>
                <p className="mt-2 text-sm text-text-muted">{active.blurb}</p>
                <Link
                  href={active.slug ? `/destinations/${active.slug}` : "/plan"}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-cyan transition-colors hover:text-saffron"
                >
                  {active.slug ? `Explore ${active.name}` : `Plan a trip via ${active.name}`}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Tap a city on the map to preview it.</p>
            )}
          </div>
        </div>

        {/* Map */}
        <div
          ref={wrapRef}
          data-inview={inView}
          className="route-map relative mx-auto w-full max-w-sm rounded-[28px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="group" aria-label="Route across India through eight cities">
            <defs>
              <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#19C3B2" />
                <stop offset="100%" stopColor="#FFB454" />
              </linearGradient>
              <filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Faint dotted guide (also the plane's rail) */}
            <path id="route-rail" d={ROUTE_D} fill="none" stroke="rgba(245,247,255,0.18)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
            {/* Self-drawing glowing route */}
            <path
              d={ROUTE_D}
              pathLength={1}
              className="route-draw"
              fill="none"
              stroke="url(#route-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#route-glow)"
            />

            {/* Plane flying the route */}
            {inView && !reduce && (
              <g>
                <path d="M7 0 L-5 -5 L-3 0 L-5 5 Z" fill="#FFB454" filter="url(#route-glow)" />
                <animateMotion dur="18s" repeatCount="indefinite" rotate="auto" begin="1.2s">
                  <mpath href="#route-rail" />
                </animateMotion>
              </g>
            )}

            {/* City pins */}
            {CITIES.map((c) => {
              const { x, y } = project(c.lon, c.lat);
              const order = ROUTE.indexOf(c.id);
              const isActive = activeId === c.id;
              const left = c.side === "l";
              return (
                <g
                  key={c.id}
                  className="route-pin"
                  style={{ ["--d" as string]: `${0.4 + order * 0.3}s` } as CSSProperties}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.name}. Show details`}
                  aria-pressed={isActive}
                  onClick={() => setActiveId(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveId(c.id);
                    }
                  }}
                >
                  {/* 44px+ tap target */}
                  <circle cx={x} cy={y} r="22" fill="transparent" />
                  <circle cx={x} cy={y} r="8" fill="#19C3B2" opacity="0.35" className="route-ripple" style={{ ["--d" as string]: `${order * 0.35}s` } as CSSProperties} />
                  {isActive && <circle cx={x} cy={y} r="12" fill="none" stroke="#FFB454" strokeWidth="1.5" />}
                  <circle cx={x} cy={y} r="7" fill={isActive ? "#FFB454" : "#19C3B2"} />
                  <circle cx={x} cy={y} r="3" fill="#fff" />
                  <text
                    x={left ? x - 14 : x + 14}
                    y={y + 4}
                    textAnchor={left ? "end" : "start"}
                    fontSize="12"
                    fontWeight="600"
                    fill="#F5F7FF"
                    stroke="#070B1E"
                    strokeWidth="3"
                    paintOrder="stroke"
                    strokeLinejoin="round"
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}

export default RouteMap;
