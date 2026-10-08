"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown, SlidersHorizontal, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface FilterChipsProps {
  groups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, values: string[]) => void;
  variant?: "horizontal" | "vertical" | "chips";
  showCounts?: boolean;
}

export function FilterChips({ groups, activeFilters, onFilterChange, variant = "horizontal", showCounts = true }: FilterChipsProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]);
  };

  const isGroupExpanded = (groupId: string) => expandedGroups.includes(groupId);

  const getActiveValues = (groupId: string) => activeFilters[groupId] || [];

  const toggleValue = (groupId: string, value: string) => {
    const current = getActiveValues(groupId);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFilterChange(groupId, next);
  };

  const clearGroup = (groupId: string) => onFilterChange(groupId, []);

  const clearAll = () => {
    Object.keys(activeFilters).forEach((groupId) => onFilterChange(groupId, []));
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v.length > 0);

  if (variant === "chips") {
    // Compact chip row for mobile
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar" role="group" aria-label="Filters">
          {groups.flatMap((group) =>
            group.options.map((option) => {
              const isActive = getActiveValues(group.id).includes(option.id);
              return (
                <motion.button
                  key={`${group.id}-${option.id}`}
                  type="button"
                  onClick={() => toggleValue(group.id, option.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    "touch-target",
                    isActive
                      ? "bg-saffron text-bg shadow-glow-saffron"
                      : "bg-surface text-text-muted border border-border hover:border-cyan/50 hover:bg-surface-hover"
                  )}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={isActive}
                >
                  {option.label}
                  {showCounts && option.count && (
                    <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", isActive ? "bg-bg/30" : "bg-surface-hover")}>
                      {option.count}
                    </span>
                  )}
                  {isActive && <X className="h-3 w-3" aria-hidden="true" />}
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (variant === "vertical") {
    // Vertical sidebar for desktop
    return (
      <div className="w-72 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="glass p-4 rounded-2xl border border-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-heading-sm font-semibold text-text">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-text-muted hover:text-error">
                <X className="mr-1 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-5">
            {groups.map((group) => (
              <FilterGroupCard
                key={group.id}
                group={group}
                activeValues={getActiveValues(group.id)}
                isExpanded={isGroupExpanded(group.id)}
                onToggle={toggleGroup}
                onValueChange={(value) => toggleValue(group.id, value)}
                onClear={() => clearGroup(group.id)}
                showCounts={showCounts}
                multiple={group.multiple}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal scrollable chips
  return (
    <div className="w-full">
      <div className="relative">
        {/* Edge fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-bg to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-bg to-transparent pointer-events-none" />

        <ScrollArea className="flex items-center gap-2 px-4 py-2" ref={scrollRef}>
          <div className="flex items-center gap-2" role="group" aria-label="Filters">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center gap-2">
                {group.options.map((option) => {
                  const isActive = getActiveValues(group.id).includes(option.id);
                  return (
                    <motion.button
                      key={`${group.id}-${option.id}`}
                      type="button"
                      onClick={() => toggleValue(group.id, option.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                        "touch-target",
                        isActive
                          ? "bg-saffron text-bg shadow-glow-saffron"
                          : "bg-surface text-text-muted border border-border hover:border-cyan/50 hover:bg-surface-hover"
                      )}
                      whileTap={{ scale: 0.95 }}
                      aria-pressed={isActive}
                    >
                      {option.label}
                      {showCounts && option.count && (
                        <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", isActive ? "bg-bg/30" : "bg-surface-hover")}>
                          {option.count}
                        </span>
                      )}
                      {isActive && <X className="h-3 w-3" aria-hidden="true" />}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function FilterGroupCard({
  group,
  activeValues,
  isExpanded,
  onToggle,
  onValueChange,
  onClear,
  showCounts,
  multiple,
}: {
  group: FilterGroup;
  activeValues: string[];
  isExpanded: boolean;
  onToggle: (groupId: string) => void;
  onValueChange: (value: string) => void;
  onClear: () => void;
  showCounts: boolean;
  multiple?: boolean;
}) {
  const hasActive = activeValues.length > 0;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onToggle(group.id)}
        className="flex items-center justify-between w-full px-2 py-1 text-left font-medium text-text hover:text-cyan transition-colors"
        aria-expanded={isExpanded}
      >
        <span>{group.label}</span>
        <div className="flex items-center gap-2">
          {hasActive && (
            <span className="text-caption text-text-muted">{activeValues.length} selected</span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-text-muted transition-transform", isExpanded && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-2 pt-1"
          >
            {group.options.map((option) => {
              const isActive = activeValues.includes(option.id);
              return (
                <label
                  key={`${group.id}-${option.id}`}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                    isActive
                      ? "bg-saffron/10 text-text"
                      : "text-text-muted hover:bg-surface-hover hover:text-text"
                  )}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name={group.id}
                    checked={isActive}
                    onChange={() => onValueChange(option.id)}
                    className={cn(
                      "h-5 w-5 cursor-pointer accent-saffron",
                      "focus:ring-2 focus:ring-cyan/50"
                    )}
                  />
                  <span className="flex-1 text-body-sm font-medium">{option.label}</span>
                  {showCounts && option.count && (
                    <span className="text-caption font-semibold text-text-muted px-2 py-0.5 rounded-full bg-surface">
                      {option.count}
                    </span>
                  )}
                </label>
              );
            })}
            {hasActive && (
              <Button variant="ghost" size="sm" onClick={onClear} className="w-full justify-start text-error hover:text-error">
                <X className="mr-1 h-4 w-4" />
                Clear {group.label.toLowerCase()}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Preset filter configurations for different search types
export const FLIGHT_FILTERS: FilterGroup[] = [
  {
    id: "stops",
    label: "Stops",
    options: [
      { id: "non-stop", label: "Non-stop" },
      { id: "1-stop", label: "1 Stop" },
      { id: "2+", label: "2+ Stops" },
    ],
  },
  {
    id: "airlines",
    label: "Airlines",
    options: [
      { id: "indigo", label: "IndiGo" },
      { id: "airindia", label: "Air India" },
      { id: "spicejet", label: "SpiceJet" },
      { id: "vistara", label: "Vistara" },
      { id: "akasa", label: "Akasa Air" },
    ],
  },
  {
    id: "times",
    label: "Departure Time",
    options: [
      { id: "morning", label: "Morning (6AM-12PM)" },
      { id: "afternoon", label: "Afternoon (12PM-6PM)" },
      { id: "evening", label: "Evening (6PM-12AM)" },
      { id: "night", label: "Night (12AM-6AM)" },
    ],
  },
  {
    id: "price",
    label: "Price Range",
    options: [
      { id: "budget", label: "Budget (Under ₹8,000)" },
      { id: "mid", label: "Mid (₹8,000-₹15,000)" },
      { id: "premium", label: "Premium (Above ₹15,000)" },
    ],
  },
];

export const HOTEL_FILTERS: FilterGroup[] = [
  {
    id: "price",
    label: "Price per Night",
    options: [
      { id: "budget", label: "Under ₹3,000" },
      { id: "mid", label: "₹3,000-₹7,000" },
      { id: "luxury", label: "₹7,000-₹15,000" },
      { id: "premium", label: "Above ₹15,000" },
    ],
  },
  {
    id: "rating",
    label: "Rating",
    options: [
      { id: "4.5+", label: "4.5+ Excellent" },
      { id: "4+", label: "4.0+ Very Good" },
      { id: "3.5+", label: "3.5+ Good" },
    ],
  },
  {
    id: "amenities",
    label: "Amenities",
    options: [
      { id: "wifi", label: "Free WiFi" },
      { id: "breakfast", label: "Breakfast Included" },
      { id: "pool", label: "Swimming Pool" },
      { id: "spa", label: "Spa & Wellness" },
      { id: "parking", label: "Free Parking" },
      { id: "ac", label: "Air Conditioning" },
    ],
    multiple: true,
  },
  {
    id: "type",
    label: "Property Type",
    options: [
      { id: "hotel", label: "Hotel" },
      { id: "resort", label: "Resort" },
      { id: "homestay", label: "Homestay" },
      { id: "hostel", label: "Hostel" },
      { id: "villa", label: "Villa" },
    ],
  },
];

export const DESTINATION_FILTERS: FilterGroup[] = [
  {
    id: "themes",
    label: "Travel Style",
    options: [
      { id: "mountains", label: "Mountains" },
      { id: "beaches", label: "Beaches" },
      { id: "heritage", label: "Heritage & Culture" },
      { id: "adventure", label: "Adventure" },
      { id: "romantic", label: "Romantic" },
      { id: "wellness", label: "Wellness" },
      { id: "wildlife", label: "Wildlife" },
      { id: "spiritual", label: "Spiritual" },
    ],
    multiple: true,
  },
  {
    id: "region",
    label: "Region",
    options: [
      { id: "north", label: "North India" },
      { id: "south", label: "South India" },
      { id: "east", label: "East India" },
      { id: "west", label: "West India" },
      { id: "northeast", label: "Northeast" },
      { id: "islands", label: "Islands" },
    ],
  },
  {
    id: "budget",
    label: "Budget Range",
    options: [
      { id: "budget", label: "Budget (Under ₹20K)" },
      { id: "mid", label: "Mid (₹20K-₹40K)" },
      { id: "premium", label: "Premium (₹40K-₹60K)" },
      { id: "luxury", label: "Luxury (Above ₹60K)" },
    ],
  },
  {
    id: "duration",
    label: "Trip Duration",
    options: [
      { id: "weekend", label: "Weekend (2-3 days)" },
      { id: "short", label: "Short (4-5 days)" },
      { id: "week", label: "Week (6-7 days)" },
      { id: "long", label: "Extended (8+ days)" },
    ],
  },
];