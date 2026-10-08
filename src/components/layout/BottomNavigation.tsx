"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Plane, Compass, MapPin, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMediaQuery";
import { useApp } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Plane },
  { href: "/destinations", label: "Explore", icon: Compass },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/wishlist", label: "Favorites", icon: Heart },
  { href: "/ai", label: "AI", icon: Sparkles },
] as const;

export default function BottomNavigation() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [mounted, setMounted] = useState(false);
  const { wishlist } = useApp();
  const savedCount = wishlist.length;

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
      className="fixed inset-x-0 bottom-0 z-[90] safe-bottom"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="glass mx-auto max-w-[400px] rounded-t-3xl border-t border-border p-1 shadow-card-hover">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;
            const badge = item.href === "/wishlist" ? savedCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "journey-press relative flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2",
                  "transition-colors duration-200",
                  isActive ? "text-[#FFB454]" : "text-text-muted hover:text-text"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={badge > 0 ? `${item.label}, ${badge} saved` : item.label}
              >
                {isActive && (
                  <motion.span
                    layoutId="journey-nav-pill"
                    className="absolute inset-0 rounded-xl border border-[#FFB454]/25 bg-[#FFB454]/10"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex h-6 w-6 items-center justify-center">
                  <Icon
                    key={`${item.href}-${isActive}`}
                    className={cn("h-6 w-6", isActive && "journey-nav-active-icon")}
                    aria-hidden="true"
                  />
                  {badge > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6B6B] px-1 text-[10px] font-bold leading-none text-white"
                    >
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "relative z-10 text-micro font-medium",
                    !isActive && "opacity-70"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
