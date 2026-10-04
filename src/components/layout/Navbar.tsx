"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Explore", href: "/destinations" },
  { label: "Flights", href: "/flights" },
  { label: "Trains", href: "/trains" },
  { label: "Cabs", href: "/cabs" },
  { label: "Packages", href: "/packages" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-navigation transition-all duration-300 safe-top",
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-ink-100 shadow-sm"
          : "bg-transparent border-b border-white/10"
      )}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-300",
            scrolled ? "h-[var(--header-h-scrolled)]" : "h-[var(--header-h)]"
          )}
        >
          <div className="flex items-center">
            <Link
              href="/"
              className={cn(
                "flex min-h-[44px] items-center gap-2.5 font-display text-xl font-semibold transition-colors",
                scrolled ? "text-ink-900" : "text-white"
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white shadow-soft">
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
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </span>
              <span>Tripifi CGR</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative inline-flex min-h-[44px] items-center text-sm font-medium transition-colors",
                  scrolled
                    ? "text-ink-700 hover:text-navy-900"
                    : "text-white/90 hover:text-white"
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100",
                    scrolled ? "bg-saffron-500" : "bg-white"
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/wishlist"
              className={cn(
                "inline-flex min-h-[44px] items-center justify-center rounded-xl px-3 py-2 text-sm transition-colors",
                scrolled
                  ? "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              Wishlist
            </Link>
            <Link
              href="/trips"
              className={cn(
                "inline-flex min-h-[44px] items-center justify-center rounded-xl px-3 py-2 text-sm transition-colors",
                scrolled
                  ? "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              My Trips
            </Link>
            <Link
              href="/profile"
              className={cn(
                "inline-flex min-h-[44px] items-center justify-center rounded-xl px-3 py-2 text-sm transition-colors",
                scrolled
                  ? "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              {user ? user.name.split(" ")[0] : "Profile"}
            </Link>
            <Link
              href="/plan"
              className="btn-navy group inline-flex min-h-[44px] items-center gap-2 shadow-soft"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Plan a Trip
            </Link>
          </div>

          <button
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(scrolled || mobileMenuOpen ? "text-ink-900" : "text-white")}
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <nav className="max-w-8xl mx-auto px-4 py-2" aria-label="Mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[44px] items-center text-sm font-medium text-ink-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-ink-100 py-2">
              <Link
                href="/trips"
                className="flex min-h-[44px] items-center text-sm font-medium text-ink-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Trips
              </Link>
              <Link
                href="/wishlist"
                className="flex min-h-[44px] items-center text-sm font-medium text-ink-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                href="/plan"
                className="btn-navy mt-2 w-full min-h-[48px] justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plan a Trip
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
