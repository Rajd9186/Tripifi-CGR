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
  const { user, login, logout } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-ink-100 shadow-sm"
          : "bg-transparent border-b border-white/10"
      )}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[var(--header-h)]">
          <div className="flex items-center">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 font-display text-xl font-semibold transition-colors",
                scrolled ? "text-ink-900" : "text-white"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white shadow-soft">
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
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </div>
              <span>Tripifi CGR</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  scrolled
                    ? "text-ink-700 hover:text-navy-900"
                    : "text-white/90 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/wishlist"
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition-colors",
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
                "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition-colors",
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
                "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition-colors",
                scrolled
                  ? "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              {user ? user.name.split(" ")[0] : "Profile"}
            </Link>
            <Link
              href="/plan"
              className="btn-navy inline-flex items-center gap-2 shadow-soft"
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
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Plan a Trip
            </Link>
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-xl p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
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
              className={cn(scrolled ? "text-ink-900" : "text-white")}
            >
              {mobileMenuOpen ? (
                <line x1="18" y1="6" x2="6" y2="18"></line>
              ) : (
                <line x1="3" y1="12" x2="21" y2="12"></line>
              )}
              {mobileMenuOpen ? (
                <line x1="6" y1="6" x2="18" y2="18"></line>
              ) : (
                <line x1="3" y1="6" x2="21" y2="6"></line>
              )}
              {mobileMenuOpen ? null : (
                <line x1="3" y1="18" x2="21" y2="18"></line>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-white">
          <div className="max-w-8xl mx-auto px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium text-ink-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-ink-100 flex flex-col gap-2">
              <Link
                href="/trips"
                className="text-sm font-medium text-ink-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Trips
              </Link>
              <Link
                href="/wishlist"
                className="text-sm font-medium text-ink-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                href="/plan"
                className="btn-navy w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plan a Trip
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
