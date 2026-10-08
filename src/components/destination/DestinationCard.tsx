"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Star, Clock, Calendar, Heart, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface DestinationCardProps {
  destination: {
    slug: string;
    name: string;
    state: string;
    region: string;
    tagline: string;
    heroImage: string;
    bestTime: string;
    idealDuration: string;
    estimatedBudget: string;
    rating?: number;
    themes?: string[];
  };
  variant?: "default" | "large" | "compact" | "editorial";
  priority?: boolean;
  index?: number;
}

export default function DestinationCard({
  destination,
  variant = "default",
  priority = false,
  index = 0,
}: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // 3D tilt effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === "compact") return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    cardRef.current!.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    cardRef.current!.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  // Budget parsing
  const budgetMatch = destination.estimatedBudget.match(/₹([\d,]+)\s*[–-]\s*₹([\d,]+)/);
  const minBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, "")) : 0;
  const maxBudget = budgetMatch ? parseInt(budgetMatch[2].replace(/,/g, "")) : 0;

  if (variant === "large") {
    return (
      <Link
        ref={cardRef}
        href={`/destinations/${destination.slug}`}
        className="group relative overflow-hidden rounded-3xl bg-bg-elevated h-[500px] block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); handleMouseLeave(); }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="absolute inset-0 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-hero animate-pulse" />
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
          <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/30 to-transparent group-hover:from-bg/100" />
        </div>

        <div className="absolute inset-0 bg-gradient-aurora opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-2 text-caption text-white/80 uppercase tracking-wider mb-3 animate-fade-up">
            <MapPin className="w-4 h-4" />
            {destination.region}
          </div>
          <motion.h3
            className="font-display text-4xl font-semibold text-white animate-fade-up-delayed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {destination.name}
          </motion.h3>
          <motion.p
            className="text-lg text-white/90 mt-3 max-w-xl line-clamp-2 animate-fade-up-delayed-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {destination.tagline}
          </motion.p>
          <motion.div
            className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90 animate-fade-up-delayed-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Best: {destination.bestTime}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {destination.idealDuration}
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron" />
              <span className="text-saffron font-medium">
                From {formatCurrency(minBudget)}
              </span>
            </div>
          </motion.div>
          <motion.div
            className="mt-8 animate-slide-up opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300"
          >
            <span className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all duration-300">
              Explore {destination.name}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.div>
        </div>

        {/* Wishlist button */}
        <motion.button
          className="absolute top-4 right-4 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center"
          onClick={toggleWishlist}
          whileTap={{ scale: 0.9 }}
          aria-label={isWishlisted ? `Remove ${destination.name} from wishlist` : `Save ${destination.name} to wishlist`}
          aria-pressed={isWishlisted}
        >
          <div className={cn(
            "p-2 rounded-xl bg-surface/80 backdrop-blur-xl border border-border transition-all duration-200",
            isWishlisted ? "bg-saffron/20 border-saffron/50 text-saffron" : "text-white/80 hover:text-saffron hover:bg-saffron/10"
          )}>
            <Heart className={cn("h-5 w-5 transition-transform", isWishlisted && "fill-current scale-110")} />
          </div>
        </motion.button>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/destinations/${destination.slug}`}
        className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 transition-all duration-300 hover:border-cyan/50 hover:shadow-card-hover hover:-translate-y-1"
      >
        <motion.div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl"
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="64px"
          />
        </motion.div>
        <div className="min-w-0 flex-1">
          <motion.h3
            className="truncate text-body font-semibold text-text group-hover:text-cyan transition-colors"
            whileHover={{ x: 4 }}
          >
            {destination.name}
          </motion.h3>
          <motion.p
            className="truncate text-caption text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {destination.state}
          </motion.p>
          <motion.div
            className="mt-2 flex items-center gap-1 text-sm text-saffron font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Star className="h-4 w-4" />
            From {formatCurrency(minBudget)}
          </motion.div>
        </div>
      </Link>
    );
  }

  if (variant === "editorial") {
    return (
      <article className="card-editorial group overflow-hidden relative">
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
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent group-hover:from-bg/95" />
          </div>
          <div className="absolute top-5 left-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 text-caption font-medium text-text shadow-sm backdrop-blur">
              <MapPin className="w-3 h-3" />
              {destination.region}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/90 px-3 py-1 text-caption font-medium text-white shadow-sm backdrop-blur">
              <Star className="w-3 h-3" />
              From {formatCurrency(minBudget)}
            </span>
          </div>
        </div>
        <div className="p-6">
          <motion.h3
            className="font-display text-xl font-semibold text-text group-hover:text-cyan transition-colors"
            whileHover={{ x: 4 }}
          >
            {destination.name}
          </motion.h3>
          <motion.p
            className="text-sm text-text-muted mt-2 line-clamp-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {destination.tagline}
          </motion.p>
          <motion.div
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {destination.bestTime}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {destination.idealDuration}
            </div>
          </motion.div>
          <Link
            href={`/destinations/${destination.slug}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan group-hover:gap-3 transition-all duration-300"
          >
            Explore {destination.name}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </article>
    );
  }

  // Default variant with full 3D tilt
  return (
    <Link
      ref={cardRef}
      href={`/destinations/${destination.slug}`}
      className={cn(
        "card-hover group flex flex-col overflow-hidden relative preserve-3d perspective-1000",
        isHovered && "shadow-card-hover"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); handleMouseLeave(); }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden preserve-3d">
          {!imageLoaded && (
            <motion.div
              className="absolute inset-0 bg-gradient-hero"
              animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
          <Image
            src={destination.heroImage}
            alt={`${destination.name} - Tripifi CGR`}
            fill
            className={cn(
              "object-cover object-center transition-all duration-700 ease-out preserve-3d",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-102",
              isHovered && "scale-110"
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent group-hover:from-bg/95 preserve-3d" />
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-text shadow-sm backdrop-blur">
            <MapPin className="w-3 h-3" />
            {destination.region}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
            <Star className="w-3 h-3" />
            From {formatCurrency(minBudget)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <motion.button
            className={cn(
              "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border transition-all duration-200",
              isWishlisted ? "bg-saffron/20 border-saffron/50 text-saffron" : "bg-surface/80 backdrop-blur-xl border-border text-white/80 hover:text-saffron hover:bg-saffron/10"
            )}
            onClick={toggleWishlist}
            whileTap={{ scale: 0.9 }}
            aria-label={isWishlisted ? `Remove ${destination.name} from wishlist` : `Save ${destination.name} to wishlist`}
            aria-pressed={isWishlisted}
          >
            <Heart className={cn("h-5 w-5 transition-transform", isWishlisted && "fill-current scale-110")} />
          </motion.button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 transition-all duration-300 animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-text shadow-lg backdrop-blur">
            <Sparkles className="w-3 h-3 text-saffron" />
            Plan your trip
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 relative" style={{ zIndex: 10 }}>
        <motion.h3
          className="font-display text-lg font-semibold text-text group-hover:text-cyan transition-colors"
          whileHover={{ x: 4 }}
        >
          {destination.name}
        </motion.h3>
        <motion.p
          className="text-sm text-text-muted mt-1 line-clamp-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {destination.tagline}
        </motion.p>
        <motion.div
          className="mt-3 text-xs text-text-muted flex items-center gap-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Calendar className="w-3 h-3" />
          {destination.bestTime}
        </motion.div>
        <motion.div
          className="mt-auto pt-4 flex items-end justify-between border-t border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="flex items-center gap-1.5 text-sm text-text-muted"
            whileHover={{ x: 4 }}
          >
            <Clock className="w-3 h-3" />
            {destination.idealDuration}
          </motion.div>
          <motion.div
            className="opacity-0 group-hover:opacity-100 translate-x-2 transition-all duration-300"
          >
            <span className="inline-flex items-center gap-1.5 text-saffron font-medium group-hover:gap-2 transition-all duration-300">
              Explore
              <ArrowRight className="w-4 h-4" />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </Link>
  );
}