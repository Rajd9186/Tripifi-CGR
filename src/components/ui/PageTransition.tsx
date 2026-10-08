"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Short fade/slide on every route change.
 * - Content is server-rendered immediately (the old version rendered a light-theme skeleton
 *   first on every navigation, which flashed and hid content from crawlers).
 * - The first paint is never animated; only client-side navigations are.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return (
    <motion.div
      key={pathname}
      className={cn(className)}
      initial={reduce || isFirst.current ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
