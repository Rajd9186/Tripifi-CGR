"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import type { Destination } from "@/data/destinations";

export function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const x = 40 + ((lng - 68) / (95 - 68)) * 720;
  const y = 460 - ((lat - 8) / (35 - 8)) * 420;
  return { x, y };
}

interface IndiaMapProps {
  destinations: Destination[];
  selectedSlug?: string | null;
  onSelect: (slug: string) => void;
}

/** Bounded schematic map of India — pins pop in on scroll into view. */
export default function IndiaMap({ destinations, selectedSlug, onSelect }: IndiaMapProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div ref={sectionRef} className="journey-map-frame rounded-3xl border border-white/10 bg-[#0B1026]/90 p-2 backdrop-blur-xl sm:p-4">
      <svg
        viewBox="0 0 800 500"
        className="h-auto w-full"
        role="img"
        aria-label="Map of India showing destination markers"
      >
        <defs>
          <radialGradient id="india-map-glow" cx="50%" cy="62%" r="60%">
            <stop offset="0%" stopColor="#19C3B2" stopOpacity="0.14" />
            <stop offset="60%" stopColor="#FFB454" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FFB454" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="800" height="500" fill="url(#india-map-glow)" rx="16" />

        {/* Schematic subcontinent outline */}
        <path
          d="M330 60 L430 60 L470 110 L520 150 L560 210 L600 260 L560 330 L500 400 L440 460 L380 430 L320 380 L260 330 L240 260 L280 190 L300 120 Z"
          fill="rgba(25,195,178,0.07)"
          stroke="rgba(245,247,255,0.25)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        {destinations.map((d, i) => {
          const { x, y } = projectLatLng(d.lat, d.lng);
          const isSelected = d.slug === selectedSlug;
          return (
            <g key={d.slug}>
              <circle
                cx={x}
                cy={y}
                r="13"
                fill="none"
                stroke={isSelected ? "#FFB454" : "#19C3B2"}
                strokeWidth="1.5"
                className={cn("journey-ripple", visible && "is-visible")}
                style={{ animationDelay: `${0.3 + i * 0.12}s` }}
              />
              <g
                className={cn("journey-pin", visible && "is-visible")}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 9 : 7}
                  fill="#0B1026"
                  stroke={isSelected ? "#FFB454" : "#F5F7FF"}
                  strokeWidth="2"
                />
                <circle cx={x} cy={y} r="2.5" fill={isSelected ? "#FFB454" : "#19C3B2"} />
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  fill="#F5F7FF"
                  fontSize="13"
                  fontWeight="600"
                  style={{ paintOrder: "stroke", stroke: "#0B1026", strokeWidth: 4 }}
                >
                  {d.name.split(" ")[0]}
                </text>
                <circle
                  cx={x}
                  cy={y}
                  r="26"
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => onSelect(d.slug)}
                >
                  <title>{`${d.name} — view details`}</title>
                </circle>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
