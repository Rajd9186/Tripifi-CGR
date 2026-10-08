"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useInView } from "@/hooks/useInView";

interface CountUpProps {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
  label: string;
}

/** Count-up number on first view, with shimmer on the digits. */
export default function CountUp({ to, suffix = "", duration = 1400, className, label }: CountUpProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reducedMotion, to, duration]);

  return (
    <div ref={ref} className="text-center" aria-label={`${value}${suffix} ${label}`}>
      <div className={cn("journey-stat-number font-display text-display-xl font-bold", className)}>
        {value.toLocaleString("en-IN")}
        {suffix}
      </div>
    </div>
  );
}
