"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useMediaQuery";

import { getDestinationMedia } from "@/lib/media/media-provider";

// Hero backgrounds — resolved through /api/media (local licensed file >
// curated Unsplash > destination fallback), so slides are always accurate
// and never blank. Slugs double as alt-text sources.
const HERO_DESTINATIONS = [
  "kashmir",
  "kerala",
  "rajasthan",
  "goa",
  "sikkim",
  "ladakh",
  "meghalaya",
];

// CSS-only aurora background (replaces the former WebGL shader layer)
function AuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Warm tint over photography (photos sit beneath this layer). */}
      <div className="absolute inset-0 bg-gradient-hero opacity-40" />
      <div className="absolute inset-0 animate-gradient-shift bg-gradient-aurora opacity-60" />
      <div
        className="absolute inset-0 animate-gradient-shift bg-gradient-aurora opacity-40"
        style={{ animationDirection: "reverse", animationDuration: "12s" }}
      />
      <div
        className="absolute inset-0 animate-gradient-shift bg-gradient-aurora opacity-25"
        style={{ animationDuration: "16s" }}
      />
      <div className="absolute inset-0 bg-gradient-vignette" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          animation: "float 8s infinite ease-in-out",
        }}
      />
    </div>
  );
}

// Ken Burns image slider (media-API backed, with per-image fallback hiding)
function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState<{ src: string; alt: string }[]>([]);
  const [failed, setFailed] = useState<Record<string, true>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      HERO_DESTINATIONS.map(async (slug) => {
        try {
          const media = await getDestinationMedia(slug);
          return media?.hero
            ? { src: media.hero.src, alt: media.hero.alt || `${slug} — Tripifi CGR` }
            : null;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (!cancelled) setSlides(results.filter((s): s is { src: string; alt: string } => !!s));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const visible = slides.filter((s) => !failed[s.src]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {visible.map((slide, index) => (
        <motion.img
          key={slide.src}
          src={slide.src}
          alt=""
          onError={() => setFailed((f) => ({ ...f, [slide.src]: true }))}
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={false}
          animate={{
            opacity: index === currentIndex % Math.max(visible.length, 1) ? 1 : 0,
            scale: index === currentIndex % Math.max(visible.length, 1) ? 1.08 : 1,
          }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: "contrast(1.05) saturate(1.12) brightness(0.95)" }}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "low"}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-scrim-top" />
      <div className="absolute inset-0 bg-gradient-scrim" />
      <div className="absolute inset-0 bg-gradient-vignette" />
    </div>
  );
}

/**
 * HeroJourney — airplane following an animated dashed flight path
 * between cities (SMIL animateMotion, no JS per frame), fading
 * contrail, pins pulse on arrival. Static snapshot when the user
 * prefers reduced motion.
 */
function HeroJourney({ reducedMotion }: { reducedMotion: boolean }) {
  const pathD = "M 20 130 C 150 50, 300 150, 420 80 S 540 60, 580 45";
  return (
    <div className="pointer-events-none relative mx-auto mt-10 w-full max-w-3xl" aria-hidden="true">
      <svg viewBox="0 0 600 160" className="h-auto w-full" role="presentation">
        <defs>
          <linearGradient id="hero-journey-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#19C3B2" />
            <stop offset="55%" stopColor="#FFB454" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </linearGradient>
        </defs>
        {/* Base dashed path */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#hero-journey-gradient)"
          strokeWidth="2"
          strokeDasharray="8 8"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Fading contrail */}
        {!reducedMotion && (
          <path
            d={pathD}
            fill="none"
            stroke="#FFB454"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0"
          >
            <animate attributeName="opacity" values="0.55;0" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="5;9" dur="2.4s" repeatCount="indefinite" />
          </path>
        )}
        {/* City pins */}
        {[
          { x: 20, y: 130, label: "DEL" },
          { x: 300, y: 118, label: "VNS" },
          { x: 580, y: 45, label: "CCU" },
        ].map((pin, i) => (
          <g key={pin.label}>
            <circle
              cx={pin.x}
              cy={pin.y}
              r="5"
              fill="#0B1026"
              stroke="#FFB454"
              strokeWidth="2"
            >
              {!reducedMotion && (
                <animate attributeName="r" values="5;5;7;5" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
              )}
            </circle>
            <text x={pin.x} y={pin.y + 20} textAnchor="middle" fill="#F5F7FF" fontSize="11" fontWeight="600" opacity="0.85">
              {pin.label}
            </text>
          </g>
        ))}
        {/* Paper plane (travel motif) with sun-glow halo */}
        {reducedMotion ? (
          <g transform="translate(580 45)">
            <path d="M-10 1 L10 1 L-2 6 L-4 1 L-2 -4 Z" fill="#F5F7FF" />
          </g>
        ) : (
          <g>
            <circle r="12" fill="#FFB454" opacity="0.25">
              <animateMotion dur="9s" repeatCount="indefinite" path={pathD} />
            </circle>
            <g className="journey-plane-bob">
              <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path={pathD} />
              <path
                d="M-11 1 L11 1 L-3 7 L-5 1 L-3 -5 Z"
                fill="#FFF7E8"
                stroke="#FFB454"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M-5 1 L11 1" stroke="#C74A00" strokeWidth="1" opacity="0.6" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

function ScrollIndicator({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-text-muted sm:flex"
      animate={reducedMotion ? {} : { y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex h-10 w-6 items-start justify-center rounded-full border border-text-muted/50 p-1.5">
        <motion.div
          className="h-1.5 w-1 rounded-full bg-cyan"
          animate={{ scaleY: [1, 0.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <span className="text-micro font-medium uppercase tracking-widest">Scroll</span>
    </motion.div>
  );
}

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Subtle scroll parallax on the hero copy (one transform write per frame).
  useEffect(() => {
    const el = contentRef.current;
    if (!el || reducedMotion) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY, window.innerHeight);
      el.style.transform = `translate3d(0, ${(y * 0.18).toFixed(1)}px, 0)`;
      el.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
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
  }, [reducedMotion]);

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      <ImageSlider />
      <AuroraBackdrop />
      {/* Sun glow over the daylight sky */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 left-1/2 top-[8%] h-[46vmin] w-[46vmin] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(255,236,190,0.9), rgba(255,200,120,0.35) 55%, transparent 72%)",
        }}
      />

      <div ref={contentRef} className="relative z-10 mx-auto max-w-8xl px-4 pb-32 pt-20 sm:px-6 lg:px-8 will-change-transform">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            id="hero-title"
            className="font-display text-display-2xl font-semibold leading-[1.1] tracking-tighter text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="block">Discover</span>
            <motion.span
              className="relative inline-block bg-gradient-to-r from-cyan via-violet to-saffron bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              India
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Like Never Before
            </motion.span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-white/80 sm:text-heading-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            From the snow-capped Himalayas to the sun-kissed beaches of Goa, plan your
            perfect journey with AI-powered intelligence.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.a
              href="/ai"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary journey-press journey-cta-glow cta-plane min-h-[56px] px-10 text-body-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
              Plan My Trip with AI
            </motion.a>
            <motion.a
              href="/destinations"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cta-plane inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-10 text-body-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Explore Destinations
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Animated flight path */}
          <HeroJourney reducedMotion={reducedMotion} />

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-8 text-text-dim"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-2">
              <span className="font-display text-display-sm font-semibold text-cyan">12K+</span>
              <span className="text-body-sm">Happy Travellers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-display-sm font-semibold text-violet">250+</span>
              <span className="text-body-sm">Destinations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-display-sm font-semibold text-saffron">98%</span>
              <span className="text-body-sm">Satisfaction</span>
            </div>
          </motion.div>
        </div>

        <ScrollIndicator reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}
