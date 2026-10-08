"use client";

import { useState, useEffect, useCallback } from "react";

interface ScrollPosition {
  x: number;
  y: number;
  direction: "up" | "down" | null;
  isScrolled: boolean;
}

export function useScrollPosition(threshold = 10): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
    isScrolled: false,
  });

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    const x = window.scrollX;
    setPosition((prev) => ({
      x,
      y,
      direction: y > prev.y ? "down" : y < prev.y ? "up" : null,
      isScrolled: y > threshold,
    }));
  }, [threshold]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  return position;
}

export function useScrollDirection(): "up" | "down" | null {
  const { direction } = useScrollPosition();
  return direction;
}