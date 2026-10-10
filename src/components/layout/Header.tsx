"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Search, Sparkles, Heart, MapPin, User, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/useMediaQuery";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Explore" },
  { href: "/trips", label: "My Trips" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/ai", label: "AI Planner" },
];

const QUICK_ACTIONS = [
  { href: "/flights", icon: Search, label: "Flights" },
  { href: "/hotels", icon: MapPin, label: "Hotels" },
  { href: "/packages", icon: Sparkles, label: "Packages" },
];

function Logo({ overlay }: { overlay?: boolean }) {
  return (
    <Link href="/" className="flex min-h-[44px] items-center gap-2" aria-label="Tripifi CGR Home">
      <motion.span
        className={cn(
          "text-display-sm font-display font-bold",
          overlay ? "text-white [text-shadow:0_1px_12px_rgba(6,15,32,0.65)]" : "text-text"
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ scale: 1.05 }}
      >
        Tripifi
      </motion.span>
      <span className={cn("text-caption font-medium uppercase tracking-wider hidden sm:block", overlay ? "text-saffron-300 [text-shadow:0_1px_10px_rgba(6,15,32,0.6)]" : "text-saffron")}>CGR</span>
    </Link>
  );
}

function DesktopNav({ overlay }: { overlay?: boolean }) {
  return (
    <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative inline-flex min-h-[44px] items-center px-4 py-2 text-body-sm font-medium transition-colors duration-200 rounded-lg",
            overlay
              ? "text-white/95 hover:text-white hover:bg-white/10 [text-shadow:0_1px_10px_rgba(6,15,32,0.6)]"
              : "text-text-muted hover:text-text hover:bg-surface"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function ThemeToggle({ overlay }: { overlay?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors duration-200",
        overlay
          ? "text-white/95 hover:text-white hover:bg-white/10 [text-shadow:0_1px_10px_rgba(6,15,32,0.6)]"
          : "text-text-muted hover:text-text hover:bg-surface"
      )}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

function DesktopActions({ overlay }: { overlay?: boolean }) {
  return (
    <div className="hidden md:flex items-center gap-2">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 transition-all duration-200",
            overlay
              ? "text-white/95 hover:text-white hover:bg-white/10 [text-shadow:0_1px_10px_rgba(6,15,32,0.6)]"
              : "text-text-muted hover:text-text hover:bg-surface"
          )}
          aria-label={action.label}
        >
          <action.icon className="h-5 w-5" />
        </Link>
      ))}
      <ThemeToggle overlay={overlay} />
      <Link href="/ai" className="ml-2">
        <Button variant="saffron" size="sm" glow>
          <Sparkles className="mr-1 h-4 w-4" aria-hidden="true" />
          AI Planner
        </Button>
      </Link>
    </div>
  );
}

function MobileNav({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <nav role="navigation" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-body font-medium text-text-muted hover:text-text rounded-xl hover:bg-surface transition-all duration-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      <Separator className="border-border" />
      
      <div className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={onClose}
            className="flex flex-col items-center gap-2 p-4 rounded-xl text-text-muted hover:text-text bg-surface hover:bg-surface-hover transition-all duration-200"
          >
            <action.icon className="h-6 w-6" />
            <span className="text-caption font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
      
      <Link href="/ai" onClick={onClose}>
        <Button variant="saffron" size="lg" className="w-full" glow>
          <Sparkles className="mr-2 h-5 w-5" />
          AI Trip Planner
        </Button>
      </Link>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} role="separator" />;
}

export default function Header() {
  const { y, direction, isScrolled } = useScrollPosition(20);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useMobile();
  const headerRef = useRef<HTMLElement>(null);

  // Update scrolled state with hysteresis
  useEffect(() => {
    setScrolled(isScrolled);
  }, [isScrolled]);

  // Close the drawer on route change (Radix handles Esc/outside-tap/focus trap)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
        scrolled
          ? "glass-strong shadow-glass-hover"
          : "bg-transparent",
        direction === "down" && scrolled && !mobileMenuOpen
          ? "-translate-y-full"
          : "translate-y-0"
      )}
      role="banner"
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[var(--header-h)]">
          {/* Logo */}
          <Logo overlay={!scrolled} />

          {/* Desktop Navigation */}
          <DesktopNav overlay={!scrolled} />
          <DesktopActions overlay={!scrolled} />

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle overlay={false} />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <button
                className="touch-target rounded-xl p-2 text-text-muted hover:text-text hover:bg-surface transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={handleMenuToggle}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <SheetContent id="mobile-menu" size="full" side="right" className="p-0">
                <MobileNav onClose={handleCloseMenu} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Progress bar on scroll */}
      {scrolled && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-saffron"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "left center" }}
          aria-hidden="true"
        />
      )}
    </header>
  );
}