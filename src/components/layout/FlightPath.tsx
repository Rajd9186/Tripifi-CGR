"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface FlightPathProps {
  className?: string;
  points?: Array<{ x: number; y: number; label?: string }>;
}

export function FlightPath({ className, points = [] }: FlightPathProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const dots = dotsRef.current;
    if (!svg || !path || !dots) return;

    // Create the path
    const pathData = points.length > 0
      ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : "M 50 500 Q 400 100 800 500";

    path.setAttribute("d", pathData);

    // Animate path drawing
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    // Animate dots along path
    const dotElements = dots.querySelectorAll("circle");
    
    const ctx = gsap.context(() => {
      // Path drawing animation
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 3,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: svg,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      // Dot animation along path
      if (dotElements.length > 0) {
        gsap.to(dotElements, {
          motionPath: {
            path: path,
            align: path,
            autoRotate: false,
          },
          duration: 4,
          ease: "none",
          stagger: 0.5,
          repeat: -1,
          scrollTrigger: {
            trigger: svg,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          },
        });
      }

      // Pulse animation for destination markers
      gsap.to(".flight-destination", {
        scale: [1, 1.3, 1],
        opacity: [0.7, 1, 0.7],
        duration: 2,
        repeat: -1,
        ease: "power2.inOut",
        stagger: 0.3,
      } as any);
    }, svg);

    return () => ctx.revert();
  }, [points]);

  // Default points for India map approximation
  const defaultPoints = [
    { x: 150, y: 550, label: "Kolkata" },
    { x: 300, y: 300, label: "Varanasi" },
    { x: 450, y: 150, label: "Delhi" },
    { x: 600, y: 250, label: "Jaipur" },
    { x: 750, y: 450, label: "Mumbai" },
    { x: 600, y: 600, label: "Goa" },
    { x: 400, y: 700, label: "Kerala" },
    { x: 200, y: 600, label: "Chennai" },
  ];

  const renderPoints = points.length > 0 ? points : defaultPoints;

  return (
    <svg
      ref={svgRef}
      className={cn("fixed inset-0 -z-20 pointer-events-none overflow-visible", className)}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0.6" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dotted flight path */}
      <path
        ref={pathRef}
        fill="none"
        stroke="url(#flight-gradient)"
        strokeWidth="2"
        strokeDasharray="8 12"
        strokeLinecap="round"
        filter="url(#glow)"
        opacity="0.6"
      />

      {/* Animated dots traveling along path */}
      <g ref={dotsRef} filter="url(#glow)">
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            r={4}
            fill="#FFB347"
            opacity={0}
            filter="url(#glow)"
          />
        ))}
      </g>

      {/* Destination markers */}
      <g>
        {renderPoints.map((point, i) => (
          <g key={i} className="flight-destination">
            <circle
              cx={point.x}
              cy={point.y}
              r={8}
              fill="#22D3EE"
              opacity="0.8"
              filter="url(#glow)"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#FFFFFF"
              opacity="1"
            />
            {point.label && (
              <text
                x={point.x}
                y={point.y - 15}
                textAnchor="middle"
                className="text-micro font-medium text-text"
                fill="#F5F7FF"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
              >
                {point.label}
              </text>
            )}
          </g>
        ))}
      </g>

      {/* Subtle grid lines for depth */}
      <g opacity="0.03" stroke="#FFFFFF" strokeWidth="0.5">
        {[20, 40, 60, 80].map((p) => (
          <line key={p} x1={`${p}%`} y1="0%" x2={`${p}%`} y2="100%" />
        ))}
        {[20, 40, 60, 80].map((p) => (
          <line key={`h-${p}`} x1="0%" y1={`${p}%`} x2="100%" y2={`${p}%`} />
        ))}
      </g>
    </svg>
  );
}

// Simplified version for section backgrounds
export function SectionFlightPath({ className }: { className?: string }) {
  return (
    <svg className={cn("absolute inset-0 -z-10 pointer-events-none opacity-20", className)} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="section-flight-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M 0 100% Q 25% 30% 50% 70% T 100% 20%"
        fill="none"
        stroke="url(#section-flight-gradient)"
        strokeWidth="1.5"
        strokeDasharray="6 18"
        strokeLinecap="round"
      />
    </svg>
  );
}