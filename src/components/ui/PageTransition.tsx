"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Short slide/fade between routes. Remounts content on pathname
 * change so the entrance animation replays per page.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn("animate-fade-up", className)}
    >
      {children}
    </div>
  );
}
