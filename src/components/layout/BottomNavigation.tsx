"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Home, Compass, MapPin, Heart, Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMediaQuery";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/destinations", label: "Explore", icon: Compass },
  { href: "/trips", label: "Trips", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/ai", label: "AI Planner", icon: Sparkles },
] as const;

export default function BottomNavigation() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isMobile) return null;

  const getActiveIndex = () => {
    for (let i = 0; i < NAV_ITEMS.length; i++) {
      if (pathname === NAV_ITEMS[i].href || pathname.startsWith(NAV_ITEMS[i].href + "/")) {
        return i;
      }
    }
    return 0;
  };

  const activeIndex = getActiveIndex();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-[90] safe-bottom"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto max-w-[400px] glass rounded-t-3xl border-t border-border p-1 shadow-card-hover">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl",
                  "touch-target transition-all duration-300",
                  isActive
                    ? "text-saffron"
                    : "text-text-muted hover:text-text",
                  "active:scale-95"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                <motion.div
                  layoutId="nav-indicator"
                  className={cn(
                    "absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-saffron",
                    "transition-transform duration-300 ease-out"
                  )}
                  style={{ opacity: isActive ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
                <motion.span
                  className="relative z-10 flex h-6 w-6 items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110")} aria-hidden="true" />
                </motion.span>
                <motion.span
                  className="text-micro font-medium transition-opacity duration-200"
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 4 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}