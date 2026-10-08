"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Destination } from "@/lib/destinations";
import { cn } from "@/lib/utils";
import { CalendarIcon, ClockIcon, MapPinIcon, ArrowRightIcon, StarIcon, SparkleIcon } from "@/components/icons/BookingIcons";
import WishlistButton from "@/components/ui/WishlistButton";

interface DestinationCardProps {
  destination: Destination;
  variant?: "default" | "large" | "compact" | "editorial";
  priority?: boolean;
}

export default function DestinationCard({
  destination,
  variant = "default",
  priority = false,
}: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (variant === "large") {
    return (
      <Link
        href={`/destinations/${destination.slug}`}
        className="group relative overflow-hidden rounded-2xl bg-bg-elevated h-[420px] block"
      >
        <div className="absolute inset-0 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-navy-900 animate-skeleton-pulse" style={{ backgroundSize: "200% 100%" }} />
          )}
          <Image
            src={destination.heroImage}
            alt={`${destination.name} - Tripifi CGR`}
            fill
            className={cn(
              "object-cover object-center transition-all duration-1000 ease-out",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-102",
              isHovered && "scale-105"
            )}
            priority={priority}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/30 to-transparent group-hover:from-navy-950/100" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 text-xs text-white/80 uppercase tracking-wider mb-2 animate-fade-up">
            <MapPinIcon className="w-3 h-3" />
            {destination.region}
          </div>
          <h3 className="font-display text-3xl font-semibold text-white animate-fade-up-delayed">
            {destination.name}
          </h3>
          <p className="text-base text-white/90 mt-2 max-w-xl line-clamp-2 animate-fade-up-delayed-2">
            {destination.tagline}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90 animate-fade-up-delayed-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Best time: {destination.bestTime}
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              {destination.idealDuration}
            </div>
            <div className="flex items-center gap-2">
              <SparkleIcon className="w-4 h-4 text-saffron-400" />
              <span className="text-saffron-300 font-medium">
                From {destination.estimatedBudget.split(" ")[0].replace("₹", "₹")}
              </span>
            </div>
          </div>
          <div className="mt-6 animate-slide-up opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
            <span className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all duration-300">
              Explore {destination.name}
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/destinations/${destination.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-ink-100 bg-surface p-2 transition-all duration-300 hover:border-navy-200 hover:shadow-sm hover:-translate-y-0.5"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink-900 group-hover:text-text transition-colors">
            {destination.name}
          </h3>
          <p className="truncate text-xs text-ink-600">{destination.state}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-saffron-600 font-medium">
            <StarIcon className="w-3 h-3" />
            {destination.estimatedBudget.split(" ")[0].replace("₹", "₹")}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "editorial") {
    return (
      <article className="card-editorial group overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={destination.heroImage}
              alt={`${destination.name} - Tripifi CGR`}
              fill
              className={cn(
                "object-cover object-center transition-all duration-1000 ease-out",
                isHovered ? "scale-105" : "scale-100"
              )}
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent group-hover:from-navy-950/95" />
          </div>
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-3 py-1 text-xs font-medium text-ink-900 shadow-sm backdrop-blur">
              <MapPinIcon className="w-3 h-3" />
              {destination.region}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-500/90 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
              <StarIcon className="w-3 h-3" />
              {destination.estimatedBudget.split(" ")[0].replace("₹", "₹")}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-display text-xl font-semibold text-ink-900 group-hover:text-text transition-colors">
            {destination.name}
          </h3>
          <p className="text-sm text-ink-600 mt-2 line-clamp-2">
            {destination.tagline}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              {destination.bestTime}
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-3 h-3" />
              {destination.idealDuration}
            </div>
          </div>
          <Link
            href={`/destinations/${destination.slug}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-text group-hover:gap-3 transition-all duration-300"
          >
            Explore {destination.name}
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "card-hover group flex flex-col overflow-hidden",
        isHovered && "shadow-card-hover"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-ink-100 animate-skeleton-pulse" />
          )}
          <Image
            src={destination.heroImage}
            alt={`${destination.name} - Tripifi CGR`}
            fill
            className={cn(
              "object-cover object-center transition-all duration-700 ease-out",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-102",
              isHovered && "scale-110"
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent group-hover:from-navy-950/95" />
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-2.5 py-1 text-xs font-medium text-ink-900 shadow-sm backdrop-blur">
            <MapPinIcon className="w-3 h-3" />
            {destination.region}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
            <StarIcon className="w-3 h-3" />
            {destination.estimatedBudget.split(" ")[0].replace("₹", "₹")}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <WishlistButton id={`dest:${destination.slug}`} label={destination.name} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 transition-all duration-300 animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-3 py-1.5 text-xs font-medium text-ink-900 shadow-lg backdrop-blur">
            <SparkleIcon className="w-3 h-3 text-saffron-500" />
            Plan your trip
            <ArrowRightIcon className="w-3 h-3" />
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-semibold text-ink-900 group-hover:text-text transition-colors">
          {destination.name}
        </h3>
        <p className="text-sm text-ink-600 mt-1 line-clamp-2">
          {destination.tagline}
        </p>
        <div className="mt-3 text-xs text-ink-600 flex items-center gap-1.5">
          <CalendarIcon className="w-3 h-3" />
          {destination.bestTime}
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="flex items-center gap-1.5 text-sm text-ink-600">
            <ClockIcon className="w-3 h-3" />
            {destination.idealDuration}
          </div>
          <div className="opacity-0 group-hover:opacity-100 translate-x-2 transition-all duration-300">
            <span className="inline-flex items-center gap-1.5 text-saffron-600 font-medium group-hover:gap-2 transition-all duration-300">
              Explore
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}