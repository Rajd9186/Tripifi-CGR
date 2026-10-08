"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Home, Compass, MapPin, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, match: [] as string[] },
  { href: "/destinations", label: "Explore", icon: Compass, match: ["/flights", "/hotels", "/trains", "/cabs", "/packages"] },
  { href: "/trips", label: "Trips", icon: MapPin, match: ["/plan", "/booking", "/checkout"] },
  { href: "/wishlist", label: "Wishlist", icon: Heart, match: [] as string[] },
  { href: "/ai", label: "AI Planner", icon: Sparkles, match: [] as string[] },
];

const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(base + "/");

export default function BottomNavigation() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { wishlist, hydrated } = useApp();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[90] px-3 md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
      aria-label="Primary"
    >
      <ul className="glass mx-auto flex max-w-md items-stretch justify-between rounded-3xl border border-white/10 p-1.5 shadow-card-hover">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : isUnder(pathname, item.href) || item.match.some((m) => isUnder(pathname, m));
          const count = item.href === "/wishlist" && hydrated ? wishlist.length : 0;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[11px] font-medium transition-colors active:scale-95",
                  active ? "text-saffron" : "text-text-muted hover:text-text"
                )}
              >
                {/* One shared pill that slides between tabs */}
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-saffron/15 ring-1 ring-saffron/30"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <motion.span
                  key={active ? "on" : "off"}
                  className="relative z-10"
                  animate={active && !reduce ? { y: [0, -5, 0], scale: [1, 1.18, 1] } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  {count > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold leading-none text-white">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </motion.span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
