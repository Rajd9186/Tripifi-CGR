"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** stagger step: 0-8 maps to 0-400ms delay */
  stagger?: number;
  as?: "div" | "li" | "article" | "section";
}

/** Staggered fade-up on scroll (transform/opacity only). */
export default function Reveal({ children, className, stagger = 0, as = "div" }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      className={cn("journey-reveal", inView && "is-visible", className)}
      style={{ transitionDelay: stagger > 0 ? `${Math.min(stagger, 8) * 50}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
