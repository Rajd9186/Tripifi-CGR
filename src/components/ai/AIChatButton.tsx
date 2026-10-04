"use client";

import { useState } from "react";
import TripifiAI from "./TripifiAI";

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 md:hidden flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-white shadow-glow animate-float-soft"
        aria-label="Tripifi AI"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
        </svg>
      </button>

      <div className="hidden md:block fixed bottom-6 right-6 z-40 animate-float-soft" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-navy shadow-glow"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
          </svg>
          Tripifi AI
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-4 right-4 left-4 z-50 md:left-auto md:bottom-6 md:right-6 md:w-[420px] rounded-2xl overflow-hidden shadow-lift border border-ink-100">
            <TripifiAI onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
