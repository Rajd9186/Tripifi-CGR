"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useMediaQuery";

// Hero background images — real India photography
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80", // Himalayas / Sikkim
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1920&q=80", // Kerala backwaters
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1920&q=80", // Rajasthan forts
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=80", // Goa coast
  "https://images.unsplash.com/photo-1626624340240-aadc087844fa?w=1920&q=80", // Northeast hills
];

// CSS-only aurora background (replaces the former WebGL shader layer)
function AuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-hero" />
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

// Ken Burns image slider
function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {HERO_IMAGES.map((src, index) => (
        <motion.img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={false}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1.15 : 1,
          }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: "contrast(1.1) saturate(1.2) brightness(0.9)" }}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "low"}
        />
      ))}
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
        {/* Airplane */}
        {reducedMotion ? (
          <g transform="translate(580 45)">
            <path d="M-9 0 L9 0 M0 -7 L0 7 M-5 -5 L5 5 M-5 5 L5 -5" stroke="#F5F7FF" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle r="10" fill="#FFB454" opacity="0.25">
              <animateMotion dur="9s" repeatCount="indefinite" path={pathD} />
            </circle>
            <g className="journey-plane-bob">
              <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path={pathD} />
              <path
                d="M-10 0 L10 0 M0 -8 L0 8 M-6 -6 L6 6 M-6 6 L6 -6"
                stroke="#F5F7FF"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
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

  useEffect(() => setMounted(true), []);

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      <ImageSlider />
      <AuroraBackdrop />

      <div className="relative z-10 mx-auto max-w-8xl px-4 pb-32 pt-20 sm:px-6 lg:px-8">
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
              className="btn-primary journey-press journey-cta-glow min-h-[56px] px-10 text-body-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
              Plan My Trip with AI
            </motion.a>
            <motion.a
              href="/destinations"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline min-h-[56px] px-10 text-body-lg"
            >
              Explore Destinations
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
