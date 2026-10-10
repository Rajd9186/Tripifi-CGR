"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import TripifiAI from "./TripifiAI";
import { cn } from "@/lib/utils";

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      {/* Mobile: compact FAB above bottom nav */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ask Tripifi AI"
        className="fixed bottom-[104px] right-4 z-floating flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full bg-navy-900 text-white shadow-glow transition-transform duration-200 hover:scale-105 active:scale-95 md:hidden safe-bottom"
      >
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-navy-900 bg-teal-400" />
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
        </svg>
      </button>

      {/* Desktop: pill control */}
      <div className="fixed bottom-6 right-6 z-floating hidden md:block">
        <button
          onClick={() => setIsOpen(true)}
          className="btn-navy group inline-flex min-h-[48px] items-center gap-2.5 rounded-full py-3 pl-4 pr-5 shadow-glow"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
          </svg>
          <span>Tripifi AI</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn("fixed inset-0 z-modal")}
            role="dialog"
            aria-modal="true"
            aria-label="Tripifi AI assistant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute inset-x-3 bottom-3 top-auto max-h-[86dvh] overflow-hidden rounded-3xl border border-ink-100 bg-surface shadow-lift safe-bottom md:inset-auto md:bottom-6 md:right-6 md:top-auto md:h-[640px] md:w-[420px] md:rounded-2xl"
              initial={{ opacity: 0, y: 48, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              <TripifiAI onClose={() => setIsOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
