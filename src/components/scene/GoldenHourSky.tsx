"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useMediaQuery";

/**
 * GoldenHourSky — layered twilight scene behind the whole app.
 * Deep indigo -> teal -> warm amber horizon, twinkling stars,
 * drifting clouds, Indian landmark silhouettes (Himalayas, ghat,
 * temple spire). SVG + CSS only, pointer-events none.
 * Parallax layers translate at different speeds (rAF-throttled).
 */
const STARS: Array<{ x: number; y: number; s: number; d: string }> = [
  { x: 6, y: 6, s: 1.6, d: "0s" },
  { x: 14, y: 18, s: 1.1, d: "0.7s" },
  { x: 22, y: 8, s: 2, d: "1.4s" },
  { x: 31, y: 22, s: 1.2, d: "0.3s" },
  { x: 40, y: 5, s: 1.5, d: "2.1s" },
  { x: 48, y: 14, s: 1, d: "1.1s" },
  { x: 56, y: 7, s: 1.8, d: "0.5s" },
  { x: 63, y: 20, s: 1.1, d: "2.6s" },
  { x: 71, y: 9, s: 1.4, d: "1.8s" },
  { x: 79, y: 16, s: 1, d: "0.9s" },
  { x: 86, y: 6, s: 1.7, d: "2.3s" },
  { x: 93, y: 21, s: 1.2, d: "1.5s" },
  { x: 97, y: 10, s: 1.5, d: "0.2s" },
  { x: 10, y: 30, s: 1, d: "1.9s" },
  { x: 90, y: 30, s: 1.1, d: "0.6s" },
];

export default function GoldenHourSky() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;
    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    if (layers.length === 0) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      for (const layer of layers) {
        const speed = parseFloat(layer.dataset.parallax ?? "0");
        layer.style.transform = `translateY(${Math.round(y * speed)}px)`;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* Twilight gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-twilight)" }}
      />

      {/* Stars */}
      <svg
        className="absolute inset-x-0 top-0 h-[42vh] w-full"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.s / 10}
            fill="#F5F7FF"
            className="journey-star"
            style={{ animationDelay: s.d, opacity: 0.8 }}
          />
        ))}
      </svg>

      {/* Clouds — far layer */}
      <div data-parallax="0.04" className="absolute inset-0 will-change-transform">
        <div
          className="journey-cloud-slow absolute left-[-10%] top-[16%] h-16 w-[55%] rounded-full opacity-25 blur-2xl"
          style={{ background: "rgba(245,247,255,0.5)" }}
        />
        <div
          className="journey-cloud absolute right-[-15%] top-[30%] h-20 w-[60%] rounded-full opacity-20 blur-2xl"
          style={{ background: "rgba(255,180,84,0.55)" }}
        />
      </div>

      {/* Amber horizon glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38vh]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 100%, rgba(255,180,84,0.5) 0%, rgba(255,107,107,0.18) 38%, transparent 70%)",
        }}
      />

      {/* Silhouettes — near layer (Himalayas, ghat steps, temple spire) */}
      <div data-parallax="0.1" className="absolute inset-x-0 bottom-0 will-change-transform">
        <svg
          className="block h-[26vh] min-h-[180px] w-full"
          viewBox="0 0 1440 220"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* Himalaya ridge */}
          <path
            d="M0,150 L90,70 L160,130 L250,40 L330,120 L420,60 L500,140 L610,55 L700,130 L800,75 L900,140 L1010,60 L1100,130 L1200,70 L1300,140 L1380,90 L1440,120 L1440,220 L0,220 Z"
            fill="#0B1026"
            opacity="0.92"
          />
          {/* Snow caps */}
          <path
            d="M250,40 L278,72 L250,66 L226,74 Z M610,55 L636,86 L610,80 L586,88 Z M1010,60 L1034,88 L1010,82 L988,90 Z"
            fill="#F5F7FF"
            opacity="0.5"
          />
          {/* Ghat steps, left */}
          <g fill="#0B1026" opacity="0.95">
            <rect x="60" y="170" width="220" height="12" rx="2" />
            <rect x="80" y="182" width="180" height="12" rx="2" />
            <rect x="100" y="194" width="140" height="12" rx="2" />
          </g>
          {/* Temple spire, right */}
          <g fill="#0B1026" opacity="0.95">
            <rect x="1180" y="150" width="90" height="70" rx="4" />
            <path d="M1192,150 L1225,80 L1258,150 Z" />
            <rect x="1221" y="60" width="8" height="24" rx="4" />
            <circle cx="1225" cy="52" r="6" />
            <rect x="1205" y="172" width="40" height="26" rx="8" fill="#FFB454" opacity="0.85" />
          </g>
          {/* Diya dots along ghat */}
          <g fill="#FFB454" opacity="0.9">
            <circle cx="90" cy="166" r="3" className="journey-star" />
            <circle cx="140" cy="166" r="3" className="journey-star" style={{ animationDelay: "1s" }} />
            <circle cx="190" cy="166" r="3" className="journey-star" style={{ animationDelay: "2s" }} />
            <circle cx="240" cy="166" r="3" className="journey-star" style={{ animationDelay: "0.5s" }} />
          </g>
        </svg>
      </div>

      {/* Bottom fade into page surface */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background: "linear-gradient(to top, rgba(7,11,29,0.9), transparent)",
        }}
      />
    </div>
  );
}
