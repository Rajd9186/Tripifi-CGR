"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CalendarIcon, ClockIcon, MapPinIcon, ArrowRightIcon, StarIcon, ShieldIcon, HeartIcon, TagIcon, PlusIcon, ChevronDownIcon, ShieldCheckIcon, SparkleIcon } from "@/components/icons/BookingIcons";
import { useApp } from "@/lib/store";
import type { PackageOffer } from "@/lib/api/types";

function PackageWishlistButton({ slug, title }: { slug: string; title: string }) {
  const { wishlist, toggleWishlist } = useApp();
  const saved = wishlist.includes(`pkg:${slug}`);
  return (
    <button
      type="button"
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-all duration-200 hover:border-saffron-300 hover:bg-saffron-50 hover:text-saffron-600"
      aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(`pkg:${slug}`);
      }}
    >
      <HeartIcon className="w-5 h-5" filled={saved} />
    </button>
  );
}

/** Local UI shape — richer than API, includes image/highlights/rating for display */
export interface Package {
  slug: string;
  title: string;
  route: string;
  duration: string;
  price: number;
  image: string;
  tags: string[];
  highlights: string[];
  inclusions: string[];
  rating?: number;
  originalPrice?: number;
}

/** Convert backend PackageOffer to frontend Package UI shape with sensible defaults */
function toUIPackage(p: PackageOffer): Package {
  const destImages: Record<string, string> = {
    "sikkim": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    "kashmir": "https://images.unsplash.com/photo-1584285405429-136bf988919c?w=1200&q=80",
    "ladakh": "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200&q=80",
    "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80",
    "rajasthan": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80",
    "andaman": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
  };
  return {
    slug: p.slug,
    title: p.title,
    route: p.route,
    duration: p.duration,
    price: p.base_price,
    image: destImages[p.destination.toLowerCase()] || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
    tags: p.tags,
    highlights: p.inclusions.slice(0, 4),
    inclusions: p.inclusions,
    rating: 4.5,
  };
}

interface PackageCardProps {
  pkg: Package | PackageOffer;
  variant?: "default" | "featured" | "compact";
  priority?: boolean;
}

export default function PackageCard({
  pkg: rawPkg,
  variant = "default",
  priority = false,
}: PackageCardProps) {
  const pkg = "id" in rawPkg ? toUIPackage(rawPkg) : rawPkg;
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showInclusions, setShowInclusions] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price;
  const discountPercent = hasDiscount ? Math.round(((pkg.originalPrice! - pkg.price) / pkg.originalPrice!) * 100) : 0;

  if (variant === "featured") {
    return (
      <article className="card-editorial group relative overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              className={cn(
                "object-cover object-center transition-all duration-1000 ease-out",
                isHovered ? "scale-105" : "scale-100"
              )}
              priority={true}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent group-hover:from-navy-950/95" />
          </div>

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-3 py-1 text-xs font-medium text-ink-900 shadow-sm backdrop-blur">
              {pkg.tags[0] || "Package"}
            </span>
            {hasDiscount && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-500 px-3 py-1 text-xs font-medium text-[#10161C] shadow-sm">
                <TagIcon className="w-3 h-3" />
                {discountPercent}% OFF
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-500/90 px-3 py-1 text-xs font-medium text-[#10161C] shadow-sm backdrop-blur">
              <StarIcon className="w-3 h-3" />
              {pkg.rating || 4.8}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between animate-fade-up">
            <div className="flex items-center gap-2 text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-3 py-1.5 text-xs font-medium text-ink-900 shadow-lg backdrop-blur">
                <MapPinIcon className="w-3 h-3" />
                {pkg.route.split("→")[0].trim()}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 translate-y-2 transition-all duration-300">
              <Link
                href={`/packages/${pkg.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-4 py-2 text-xs font-medium text-ink-900 shadow-lg backdrop-blur group-hover:gap-2 transition-all duration-300"
              >
                View Details
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <h3 className="font-display text-2xl font-semibold text-white animate-fade-up">
            {pkg.title}
          </h3>
          <p className="text-base text-white/90 mt-2 max-w-xl line-clamp-2 animate-fade-up-delayed">
            {pkg.route}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90 animate-fade-up-delayed-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {pkg.duration}
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-saffron-400" />
              {pkg.rating || 4.8}
            </div>
          </div>
          <div className="mt-6 animate-slide-up opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
            <Link
              href={`/packages/${pkg.slug}`}
              className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all duration-300"
            >
              Customize This Trip
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/packages/${pkg.slug}`}
        className="group flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 transition-all duration-300 hover:border-navy-200 hover:shadow-sm hover:-translate-y-0.5"
      >
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="100vw"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-saffron-500 px-2 py-0.5 text-[10px] font-medium text-[#10161C] shadow-sm">
                <TagIcon className="w-2.5 h-2.5" />
                {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <h3 className="font-display text-base font-semibold text-ink-900 group-hover:text-text transition-colors line-clamp-1">
            {pkg.title}
          </h3>
          <p className="text-xs text-ink-600 line-clamp-1">{pkg.route}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-ink-500">
              <CalendarIcon className="w-3 h-3" />
              {pkg.duration}
            </span>
            <span className="inline-flex items-center gap-1 text-saffron-600 font-medium">
              <StarIcon className="w-3 h-3" />
              {pkg.rating || 4.8}
            </span>
          </div>
          <div className="pt-2 border-t border-ink-100 flex items-end justify-between">
            <div>
              {hasDiscount && (
                <div className="text-xs text-ink-400 line-through mb-0.5">
                  ₹{pkg.originalPrice!.toLocaleString("en-IN")}
                </div>
              )}
              <div className="text-lg font-semibold text-ink-900">
                ₹{pkg.price.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-ink-500">per person</div>
            </div>
            <Link
              href={`/packages/${pkg.slug}`}
              className="btn-primary-sm group"
            >
              View
              <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className={cn(
        "card-hover group flex flex-col overflow-hidden relative",
        isHovered && "shadow-card-hover",
        hasDiscount ? "before:absolute before:top-3 before:right-3 before:z-10" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10 animate-pop">
          <span className="inline-flex items-center gap-1 rounded-full bg-saffron-500 px-2.5 py-1 text-[11px] font-semibold text-[#10161C] shadow-lg">
            <TagIcon className="w-3 h-3" />
            {discountPercent}% OFF
          </span>
        </div>
      )}

      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-ink-100 animate-skeleton-pulse" />
          )}
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            className={cn(
              "object-cover object-center transition-all duration-700 ease-out",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-102",
              isHovered && "scale-110"
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent group-hover:from-navy-950/90" />
        </div>

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 animate-fade-up">
          {pkg.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-bg-elevated/95 px-2.5 py-1 text-[11px] font-medium text-ink-900 shadow-sm backdrop-blur">
              {tag}
            </span>
          ))}
          {pkg.rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-saffron-500/90 px-2.5 py-1 text-[11px] font-medium text-[#10161C] shadow-sm backdrop-blur">
              <StarIcon className="w-3 h-3" />
              {pkg.rating}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 transition-all duration-300 animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-3 py-1.5 text-xs font-medium text-ink-900 shadow-lg backdrop-blur">
            <ShieldIcon className="w-3 h-3 text-saffron-500" />
            Verified Partner
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-3 py-1.5 text-xs font-medium text-ink-900 shadow-lg backdrop-blur">
            <HeartIcon className="w-3 h-3 text-saffron-500" />
            Save
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg font-semibold text-ink-900 group-hover:text-text transition-colors line-clamp-1 flex-1">
            {pkg.title}
          </h3>
          {hasDiscount && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-saffron-50 px-2 py-0.5 text-[10px] font-semibold text-saffron-700">
              <TagIcon className="w-2.5 h-2.5" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <p className="text-sm text-ink-600 mt-1 line-clamp-1">{pkg.route}</p>
        <div className="text-sm text-ink-600 mt-1 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-ink-500">
            <CalendarIcon className="w-3.5 h-3.5" />
            {pkg.duration}
          </span>
          {pkg.rating && (
            <span className="inline-flex items-center gap-1 text-saffron-600 font-medium">
              <StarIcon className="w-3.5 h-3.5" />
              {pkg.rating}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {pkg.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2" role="group" aria-label="Package highlights">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowHighlights(!showHighlights); }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
              showHighlights
                ? "bg-saffron-50 text-saffron-700 border border-saffron-200"
                : "bg-ink-50 text-ink-700 border border-ink-200 hover:border-saffron-300"
            )}
            aria-expanded={showHighlights}
            aria-controls="highlights-panel"
            
          >
            <SparkleIcon className={cn("w-3 h-3 transition-transform", showHighlights && "rotate-180")} />
            Highlights
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInclusions(!showInclusions); }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
              showInclusions
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "bg-ink-50 text-ink-700 border border-ink-200 hover:border-teal-300"
            )}
            aria-expanded={showInclusions}
            aria-controls="inclusions-panel"
            
          >
            <ShieldCheckIcon className="w-3 h-3" />
            Included
          </button>
        </div>

        <div
          id="highlights-panel"
          className={cn("mt-3 overflow-hidden transition-all duration-300 ease-out", showHighlights ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}
          role="region"
          aria-label="Package highlights"
        >
          <ul className="space-y-1.5 pt-2 animate-slide-up">
            {pkg.highlights.slice(0, 4).map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-xs text-ink-600">
                <div className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-saffron-500" />
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          id="inclusions-panel"
          className={cn("mt-3 overflow-hidden transition-all duration-300 ease-out", showInclusions ? "max-h-48 opacity-100" : "max-h-0 opacity-0")}
          role="region"
          aria-label="Package inclusions"
        >
          <ul className="space-y-1.5 pt-2 animate-slide-up">
            {pkg.inclusions.slice(0, 6).map((inclusion) => (
              <li key={inclusion} className="flex items-center gap-2 text-xs text-ink-600">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span className="line-clamp-1">{inclusion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-4 border-t border-ink-100 flex items-end justify-between">
          <div>
            {hasDiscount && (
              <div className="text-xs text-ink-400 line-through mb-0.5">
                ₹{pkg.originalPrice!.toLocaleString("en-IN")}
              </div>
            )}
            <div className={cn("font-semibold text-ink-900 transition-all duration-300", isHovered && "text-xl")}>
              ₹{pkg.price.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-ink-500">per person</div>
          </div>
          <div className="flex items-center gap-2">
            <PackageWishlistButton slug={pkg.slug} title={pkg.title} />
            <Link
              href={`/packages/${pkg.slug}`}
              className="btn-ghost-sm group"
            >
              View Details
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}

