/**
 * Destination media configuration.
 * References src/data/destinations.ts (no duplication of destination data).
 * Local paths are preferred; Unsplash queries are the enhancement layer.
 */

import type { EnvironmentalEffect } from "@/lib/media/types";

interface DestinationMediaConfig {
  queries: string[];
  galleryQueries?: string[];
  localHero?: string;
  localMobileHero?: string;
  localVideo?: string;
  localPoster?: string;
  effects: EnvironmentalEffect[];
}

export const DESTINATION_MEDIA: Record<string, DestinationMediaConfig> = {
  kashmir: {
    queries: ["Kashmir India mountains", "Dal Lake Kashmir", "Srinagar Kashmir", "Gulmarg Kashmir", "Pahalgam Kashmir"],
    galleryQueries: ["Dal Lake Kashmir", "Gulmarg Kashmir"],
    localHero: "/media/destinations/kashmir/hero.webp",
    localMobileHero: "/media/destinations/kashmir/hero-mobile.webp",
    effects: ["clouds", "mist"],
  },
  ladakh: {
    queries: ["Ladakh India mountains", "Leh Ladakh", "Pangong Lake Ladakh", "Nubra Valley Ladakh"],
    galleryQueries: ["Pangong Lake Ladakh", "Leh Ladakh"],
    localHero: "/media/destinations/ladakh/hero.webp",
    localMobileHero: "/media/destinations/ladakh/hero-mobile.webp",
    effects: ["clouds", "haze"],
  },
  sikkim: {
    queries: ["Sikkim India mountains", "Gangtok Sikkim", "North Sikkim", "Kanchenjunga Sikkim"],
    galleryQueries: ["Gangtok Sikkim", "Kanchenjunga Sikkim"],
    localHero: "/media/destinations/sikkim/hero.webp",
    localMobileHero: "/media/destinations/sikkim/hero-mobile.webp",
    effects: ["clouds", "mist"],
  },
  kerala: {
    queries: ["Kerala India backwaters", "Alleppey Kerala", "Munnar Kerala", "Varkala Kerala"],
    galleryQueries: ["Alleppey Kerala", "Munnar Kerala"],
    localHero: "/media/destinations/kerala/hero.webp",
    localMobileHero: "/media/destinations/kerala/hero-mobile.webp",
    effects: ["water", "light"],
  },
  rajasthan: {
    queries: ["Rajasthan India palace", "Jaipur Rajasthan", "Udaipur Rajasthan", "Jaisalmer Rajasthan"],
    galleryQueries: ["Jaipur Rajasthan", "Udaipur Rajasthan"],
    localHero: "/media/destinations/rajasthan/hero.webp",
    localMobileHero: "/media/destinations/rajasthan/hero-mobile.webp",
    effects: ["dust", "light"],
  },
  goa: {
    queries: ["Goa India beach", "Goa coastline", "North Goa", "South Goa"],
    galleryQueries: ["Goa India beach", "South Goa"],
    localHero: "/media/destinations/goa/hero.webp",
    localMobileHero: "/media/destinations/goa/hero-mobile.webp",
    effects: ["water", "light"],
  },
  meghalaya: {
    queries: ["Meghalaya India", "Shillong Meghalaya", "Cherrapunji Meghalaya", "Meghalaya waterfalls"],
    galleryQueries: ["Shillong Meghalaya", "Cherrapunji Meghalaya"],
    localHero: "/media/destinations/meghalaya/hero.webp",
    localMobileHero: "/media/destinations/meghalaya/hero-mobile.webp",
    effects: ["clouds", "mist"],
  },
  darjeeling: {
    queries: ["Darjeeling India", "Darjeeling Himalayas", "Darjeeling tea gardens", "Kanchenjunga Darjeeling"],
    galleryQueries: ["Darjeeling tea gardens", "Darjeeling Himalayas"],
    localHero: "/media/destinations/darjeeling/hero.webp",
    localMobileHero: "/media/destinations/darjeeling/hero-mobile.webp",
    effects: ["mist", "clouds"],
  },
};

export function mediaConfigFor(destination: string): DestinationMediaConfig | null {
  return DESTINATION_MEDIA[destination.toLowerCase()] ?? null;
}
