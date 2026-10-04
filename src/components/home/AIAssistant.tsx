"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const promptExamples = [
  "5 days in Kashmir under ₹50,000",
  "Weekend trip from Kolkata",
  "Honeymoon in Kerala",
  "Family trip to Rajasthan",
  "Mountain escape for two under ₹40,000",
  "Solo adventure in Ladakh",
  "Weekend getaway from Mumbai to Goa",
  "Spiritual journey to Varanasi",
];

export default function AIAssistant() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chipsVisible, setChipsVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chipsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const rotatePlaceholder = useCallback(() => {
    if (prefersReducedMotion.current) return;
    setPlaceholderIndex((prev) => (prev + 1) % promptExamples.length);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion.current) return;
    placeholderIntervalRef.current = setInterval(rotatePlaceholder, 3500);
    return () => { if (placeholderIntervalRef.current) clearInterval(placeholderIntervalRef.current); };
  }, [rotatePlaceholder]);

  useEffect(() => {
    chipsTimeoutRef.current = setTimeout(() => setChipsVisible(true), 800);
    return () => { if (chipsTimeoutRef.current) clearTimeout(chipsTimeoutRef.current); };
  }, []);

  const handleVoiceClick = () => {
    if (isListening) return;
    setIsListening(true);
    const timeout = setTimeout(() => setIsListening(false), 3000);
    return () => clearTimeout(timeout);
  };

  const handleFocus = () => setIsInputFocused(true);
  const handleBlur = () => setIsInputFocused(false);

  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8 animate-slide-up">
      <div className="max-w-8xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-5">
            <svg className="absolute bottom-0 right-0 w-1/2 h-1/2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="aiGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1B9AAA" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#1B9AAA" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#aiGlow)" className="animate-pulse" style={{ animationDuration: "4s" }} />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-400 mb-4 animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Tripifi AI
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white animate-fade-up-delayed">
                Tell Tripifi where you want to go...
              </h2>
              <p className="mt-3 text-base text-white/70 animate-fade-up-delayed-2">
                Let your personal travel concierge build the perfect itinerary for you
              </p>
            </div>

            <div className="relative animate-fade-up-delayed-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={promptExamples[placeholderIndex]}
                  className={cn(
                    "field w-full pr-24 py-4 text-base bg-white/5 border-white/10 text-white placeholder:text-white/40",
                    "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
                    "transition-all duration-300",
                    isInputFocused && "border-teal-500 ring-2 ring-teal-500/20 bg-white/10"
                  )}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                      e.preventDefault();
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    onClick={handleVoiceClick}
                    className={cn(
                      "inline-flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300",
                      isListening
                        ? "bg-teal-500 text-white animate-pulse ring-2 ring-teal-500/50"
                        : "bg-white/5 text-ink-500 hover:bg-white/10 hover:text-white"
                    )}
                    aria-label={isListening ? "Listening..." : "Voice input"}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={isListening ? "3" : "2"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(isListening && "animate-pulse")}
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                    {isListening && (
                      <span className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-teal-500 animate-ping opacity-75" />
                    )}
                  </button>
                  <Link
                    href="/plan"
                    className={cn(
                      "btn-primary px-4 py-2.5 text-sm group",
                      isInputFocused && "ring-2 ring-teal-500/30"
                    )}
                  >
                    Plan with AI
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-teal-500/10 via-transparent to-transparent" />
              </div>
            </div>

            <div className={cn("mt-6 flex flex-wrap justify-center gap-2", chipsVisible ? "animate-fade-up" : "opacity-0")} style={{ transitionDelay: chipsVisible ? "0ms" : "0ms" }}>
              {promptExamples.map((prompt, index) => (
                <button
                  key={prompt}
                  onClick={() => inputRef.current?.focus()}
                  className={cn(
                    "chip text-xs group relative overflow-hidden",
                    "transition-all duration-300",
                    "hover:border-teal-500 hover:text-teal-400 hover:bg-teal-500/10",
                    "animate-fade-up"
                  )}
                  style={{
                    animationDelay: `${index * 80}ms`,
                    opacity: chipsVisible ? 1 : 0,
                    transform: chipsVisible ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <span className="relative z-10">{prompt}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}