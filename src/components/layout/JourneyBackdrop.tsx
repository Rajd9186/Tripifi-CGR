"use client";

import { useEffect, useMemo, useRef } from "react";

/** Deterministic pseudo-random so server and client render identical stars (no hydration mismatch). */
function starShadows(count: number, seed: number): string {
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: count }, () => {
    const x = (rnd() * 100).toFixed(1);
    const y = (rnd() * 62).toFixed(1); // stars live in the upper sky only
    const a = (0.35 + rnd() * 0.65).toFixed(2);
    return `${x}vw ${y}vh 0 rgba(245,247,255,${a})`;
  }).join(",");
}

/**
 * Fixed, non-interactive travel scene: twilight sky -> teal -> amber horizon,
 * twinkling stars, drifting clouds, a passing plane, and three parallax
 * silhouette layers (Himalayan ridge, hills, ghat + temple skyline).
 * Pure CSS/SVG, ~2 KB, pointer-events: none, never overlaps content.
 */
export function JourneyBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const starsA = useMemo(() => starShadows(38, 7), []);
  const starsB = useMemo(() => starShadows(26, 99), []);

  // Parallax: write ONE css variable per frame; layers translate from it.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty("--sy", String(Math.min(window.scrollY, 2400)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="journey-sky" aria-hidden="true">
      <span className="journey-stars" style={{ boxShadow: starsA }} />
      <span className="journey-stars" data-b="" style={{ boxShadow: starsB }} />

      <span className="journey-cloud" style={{ top: "12%", left: "6%", width: "46vw", height: "14vh" }} />
      <span className="journey-cloud" style={{ top: "30%", right: "-8%", width: "52vw", height: "16vh", animationDuration: "110s" }} />

      <svg className="journey-plane" width="64" height="24" viewBox="0 0 64 24" fill="none">
        <path d="M0 12 H34" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 5" />
        <path d="M58 12 L44 6 L46 11 L38 11 L35 7 L33 7 L35 12 L33 17 L35 17 L38 13 L46 13 L44 18 Z" fill="currentColor" />
      </svg>

      {/* Far: Himalayan ridge */}
      <div className="journey-layer" style={{ ["--speed" as string]: 0.015, height: "46vh" }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
          <path
            d="M0 220 L120 150 L210 190 L330 100 L450 180 L560 130 L690 200 L820 120 L950 190 L1080 140 L1200 200 L1320 150 L1440 190 L1440 320 L0 320Z"
            className="journey-far"
          />
        </svg>
      </div>
      {/* Mid: rolling hills */}
      <div className="journey-layer" style={{ ["--speed" as string]: 0.03, height: "36vh" }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
          <path
            d="M0 260 L90 210 L200 250 L340 170 L470 240 L600 200 L740 260 L880 190 L1010 250 L1150 205 L1290 255 L1440 220 L1440 320 L0 320Z"
            className="journey-mid"
          />
        </svg>
      </div>
      {/* Near: ghat + temple spires skyline */}
      <div className="journey-layer" style={{ ["--speed" as string]: 0.05, height: "26vh" }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
          <path
            d="M0 320 L0 292 L140 292 L140 276 L160 276 L160 256 L172 256 L172 232 L184 205 L196 232 L196 256 L208 256 L208 276 L228 276 L228 292 L520 292 L520 284 L540 284 L540 270 Q560 246 580 270 L580 284 L600 284 L600 292 L980 292 L980 278 L1000 278 L1000 258 L1012 258 L1012 236 L1024 210 L1036 236 L1036 258 L1048 258 L1048 278 L1068 278 L1068 292 L1440 292 L1440 320 Z"
            className="journey-near"
          />
        </svg>
      </div>
    </div>
  );
}

export default JourneyBackdrop;
