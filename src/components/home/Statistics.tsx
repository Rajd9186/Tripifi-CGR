"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

const stats: StatItem[] = [
  { label: "Destinations", value: 500, suffix: "+" },
  { label: "Trips Planned", value: 10, suffix: "K+", prefix: "" },
  { label: "Traveller Rating", value: 4.9, suffix: "/5", prefix: "" },
  { label: "Verified Partners", value: 200, suffix: "+" },
];

export default function Statistics() {
  const [visible, setVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!prefersReducedMotion.current) {
              stats.forEach((_, i) => {
                setTimeout(() => {
                  animateValue(i, stats[i].value, 1500);
                }, i * 150);
              });
            } else {
              setAnimatedValues(stats.map((s) => s.value));
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -100px 0px" }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const animateValue = (index: number, target: number, duration: number) => {
    const startTime = performance.now();
    const startValue = animatedValues[index];

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;

      setAnimatedValues((prev) => {
        const next = [...prev];
        next[index] = current;
        return next;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const formatValue = (value: number, stat: StatItem) => {
    if (stat.value >= 1000 && stat.suffix === "K+") {
      return (value / 1000).toFixed(value >= 1000 ? 1 : 0);
    }
    if (stat.value === 4.9) {
      return value.toFixed(1);
    }
    return Math.floor(value).toLocaleString("en-IN");
  };

  return (
    <section ref={sectionRef} className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="card bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 sm:p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg className="absolute top-0 right-0 w-1/2 h-1/2" viewBox="0 0 100 100" fill="none">
              <defs>
                <radialGradient id="statGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F28C28" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F28C28" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#statGlow)" className="animate-pulse" style={{ animationDuration: "5s" }} />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "relative text-center",
                  visible && "animate-countUp"
                )}
                style={{
                  animationDelay: visible ? `${index * 150}ms` : "0ms",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <div className="mb-2">
                  <span className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white font-tabular-nums">
                    {stat.prefix}{formatValue(animatedValues[index], stat)}{stat.suffix}
                  </span>
                </div>
                <div className="text-sm font-medium text-white/80 uppercase tracking-wider">
                  {stat.label}
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-center text-white/60 text-sm">
              Trusted by thousands of travellers across India
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}