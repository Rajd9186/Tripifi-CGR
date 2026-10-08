"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, MapPin, Plane, Home, Car, Calendar, Users, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectItem, SelectSeparator } from "@/components/ui/Select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { searchAirports, searchStations, searchDestinationsAutocomplete } from "@/data/autocomplete";
import { useScrollPosition } from "@/hooks/useScrollPosition";

const PLACEHOLDERS = [
  "Try: Spiti Valley in winter...",
  "Backwaters in Kerala...",
  "Sikkim monastery circuit...",
  "Rajasthan palace trail...",
  "Goa beach hopping...",
  "Ladakh bike trip...",
  "Kerala houseboat stay...",
  "Kashmir shikara ride...",
];

const SEARCH_TYPES = [
  { value: "destinations", label: "Destinations", icon: MapPin },
  { value: "flights", label: "Flights", icon: Plane },
  { value: "hotels", label: "Hotels", icon: Home },
  { value: "cabs", label: "Cabs", icon: Car },
] as const;

export function SearchBar({ variant = "hero", onSearch }: { variant?: "hero" | "sticky" | "page"; onSearch?: (params: Record<string, string>) => void }) {
  const router = useRouter();
  const { y, isScrolled } = useScrollPosition(100);
  const [searchType, setSearchType] = useState("destinations");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [travellers, setTravellers] = useState("1 Traveller, Economy");
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriterRef = useRef<number>();

  // Typewriter effect for placeholder
  useEffect(() => {
    if (variant === "hero") {
      typewriterRef.current = window.setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      }, 3000);
    }
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [variant]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const travCount = String(parseInt(travellers, 10) || 1);
    const travClass = travellers.includes("Business") ? "Business" : "Economy";
    const params: Record<string, string> = {
      type: searchType,
      from: primary,
      to: secondary,
      start: dateRange.start,
      end: dateRange.end,
      travellers: travCount,
      class: travClass,
    };
    if (onSearch) {
      onSearch(params);
      return;
    }
    // Default: navigate to the matching results page so submit always works.
    const q = (o: Record<string, string>) =>
      new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v))).toString();
    switch (searchType) {
      case "flights":
        router.push(`/flights/results?${q({ from: primary, to: secondary, date: dateRange.start, travellers: travCount, class: travClass })}`);
        break;
      case "trains":
        router.push(`/trains/results?${q({ from: primary, to: secondary, date: dateRange.start, class: "All Classes" })}`);
        break;
      case "hotels":
        router.push(`/hotels/results?${q({ destination: primary, checkin: dateRange.start, checkout: dateRange.end, guests: "2 Guests, 1 Room" })}`);
        break;
      case "cabs":
        router.push(`/cabs/results?${q({ pickup: primary, drop: secondary, trip: "oneway" })}`);
        break;
      default:
        router.push(primary ? `/destinations?q=${encodeURIComponent(primary)}` : "/destinations");
        break;
    }
  };

  const getInputConfig = () => {
    switch (searchType) {
      case "flights":
        return {
          label: "From",
          placeholder: "Delhi (DEL)",
          options: searchAirports(""),
          secondaryLabel: "To",
          secondaryPlaceholder: "Mumbai (BOM)",
          secondaryOptions: searchAirports(""),
        };
      case "trains":
        return {
          label: "From",
          placeholder: "Howrah (HWH)",
          options: searchStations(""),
          secondaryLabel: "To",
          secondaryPlaceholder: "New Delhi (NDLS)",
          secondaryOptions: searchStations(""),
        };
      case "hotels":
        return {
          label: "Destination",
          placeholder: "Gangtok, Sikkim",
          options: searchDestinationsAutocomplete(""),
        };
      case "cabs":
        return {
          label: "Pickup",
          placeholder: "Kolkata Airport",
          options: searchDestinationsAutocomplete(""),
          secondaryLabel: "Drop",
          secondaryPlaceholder: "Park Street",
          secondaryOptions: searchDestinationsAutocomplete(""),
        };
      default:
        return {
          label: "Search destinations",
          placeholder: PLACEHOLDERS[placeholderIndex],
          options: searchDestinationsAutocomplete(""),
        };
    }
  };

  const config = getInputConfig();

  // Sticky variant hides on scroll down, shows on scroll up
  const stickyHidden = variant === "sticky" && isScrolled && y > 200;

  return (
    <motion.div
      className={cn(
        "w-full transition-all duration-300",
        variant === "hero" && "max-w-4xl mx-auto",
        variant === "sticky" && "fixed top-20 left-1/2 -translate-x-1/2 z-[90] max-w-4xl px-4",
        variant === "page" && "max-w-4xl mx-auto",
        stickyHidden && "opacity-0 pointer-events-none -translate-y-4"
      )}
      initial={{ opacity: 0, y: variant === "sticky" ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <form onSubmit={handleSearch} className="relative">
        {/* Search type tabs */}
        <div className="no-scrollbar mb-3 flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setSearchType(type.value);
                setPrimary("");
                setSecondary("");
              }}
              className={cn(
                "flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-body-sm font-medium transition-all duration-200",
                searchType === type.value
                  ? "bg-surface-hover text-cyan shadow-sm"
                  : "text-text-muted hover:text-text"
              )}
              aria-pressed={searchType === type.value}
            >
              <type.icon className="h-4 w-4" aria-hidden="true" />
              {type.label}
            </button>
          ))}
        </div>

        {/* Main search input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" aria-hidden="true" />
            
            <AutocompleteInput
              ref={inputRef}
              key={`primary-${searchType}`}
              label={config.label}
              placeholder={config.placeholder}
              options={config.options}
              onChange={(e) => {
                setPrimary(e.target.value);
              }}
              onSelect={(option) => {
                setPrimary(option.id ? option.label : "");
              }}
              className={cn(
                "field min-h-[56px] pl-12 pr-12 text-body-lg",
                "bg-surface/80 backdrop-blur-xl border-border/50",
                "focus:border-cyan focus:ring-2 focus:ring-cyan/30",
                "shadow-glass-hover",
                isFocused && "ring-2 ring-cyan/50"
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            
            {/* Secondary input for round-trip searches */}
            {config.secondaryLabel && (
              <div className="mt-3 relative">
                <AutocompleteInput
                  key={`secondary-${searchType}`}
                  label={config.secondaryLabel}
                  placeholder={config.secondaryPlaceholder}
                  options={config.secondaryOptions}
                  onChange={(e) => {
                    setSecondary(e.target.value);
                  }}
                  onSelect={(option) => {
                    setSecondary(option.id ? option.label : "");
                  }}
                  className="field min-h-[52px] pl-12 pr-12 bg-surface/80 backdrop-blur-xl border-border/50 focus:border-cyan focus:ring-2 focus:ring-cyan/30 shadow-glass-hover"
                />
              </div>
            )}

            {/* Date picker for travel searches */}
            {["flights", "trains", "hotels"].includes(searchType) && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Input
                  label="Check-in / Departure"
                  type="date"
                  placeholder="Select date"
                  min={new Date().toISOString().split("T")[0]}
                  value={dateRange.start}
                  onChange={(e) => setDateRange((d) => ({ ...d, start: e.target.value }))}
                  className="field min-h-[52px] bg-surface/80 backdrop-blur-xl border-border/50 focus:border-cyan focus:ring-2 focus:ring-cyan/30"
                />
                <Input
                  label={searchType === "hotels" ? "Check-out" : "Return (optional)"}
                  type="date"
                  placeholder="Select date"
                  min={dateRange.start || new Date().toISOString().split("T")[0]}
                  value={dateRange.end}
                  onChange={(e) => setDateRange((d) => ({ ...d, end: e.target.value }))}
                  className="field min-h-[52px] bg-surface/80 backdrop-blur-xl border-border/50 focus:border-cyan focus:ring-2 focus:ring-cyan/30"
                />
              </div>
            )}

            {/* Travellers selector */}
            <div className="mt-3">
              <Select
                label="Travellers & Class"
                placeholder="Select"
                className="w-full"
                value={travellers}
                onValueChange={setTravellers}
              >
                <SelectItem value="1 Traveller, Economy">1 Traveller, Economy</SelectItem>
                <SelectItem value="2 Travellers, Economy">2 Travellers, Economy</SelectItem>
                <SelectItem value="3 Travellers, Economy">3 Travellers, Economy</SelectItem>
                <SelectItem value="4 Travellers, Economy">4 Travellers, Economy</SelectItem>
                <SelectSeparator />
                <SelectItem value="1 Traveller, Business">1 Traveller, Business</SelectItem>
                <SelectItem value="2 Travellers, Business">2 Travellers, Business</SelectItem>
              </Select>
            </div>
          </div>

          {/* Search button */}
          <Button
            type="submit"
            variant="saffron"
            size="xl"
            className="w-full mt-4 glow min-h-[56px]"
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
            {searchType === "destinations" ? "Explore Destinations" : `Search ${SEARCH_TYPES.find(t => t.value === searchType)?.label}`}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}