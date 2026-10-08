"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

interface CountUpStatProps {
  /** Target number. Omit and pass `staticText` for non-numeric stats like "24/7". */
  to?: number;
  suffix?: string;
  decimals?: number;
  staticText?: string;
  label: string;
  /** Stagger in ms. */
  delay?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUpStat({ to = 0, suffix = "", decimals = 0, staticText, label, delay = 0 }: CountUpStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  const finalText = staticText ?? `${to.toFixed(decimals)}${suffix}`;
  const shown = staticText ?? `${value.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    if (staticText) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    let done = false;
    const run = () => {
      const start = performance.now();
      const duration = 1600;
      const tick = (now: number) => {
        if (done) return;
        const p = Math.min((now - start) / duration, 1);
        setValue(to * easeOutCubic(p));
        if (p < 1) raf = requestAnimationFrame(tick);
        else done = true;
      };
      raf = requestAnimationFrame(tick);
      // Fallback: rAF stalls in background tabs — guarantee completion.
      fallback = setTimeout(() => {
        if (!done) {
          done = true;
          if (raf) cancelAnimationFrame(raf);
          setValue(to);
        }
      }, duration + delay + 800);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          timer = setTimeout(run, delay);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
      if (fallback) clearTimeout(fallback);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, delay, reduce, staticText]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur-xl sm:p-7"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent"
      />
      <div aria-hidden="true" className="stat-number font-display text-4xl font-bold tabular-nums sm:text-5xl">
        {shown}
      </div>
      <span className="sr-only">{finalText}</span>
      <div className="mt-2 text-sm text-text-muted">{label}</div>
    </div>
  );
}

export default CountUpStat;
