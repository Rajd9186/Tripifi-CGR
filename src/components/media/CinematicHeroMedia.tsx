"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { heroSrcSet, sizeUnsplash } from "@/lib/media/media-utils";
import type { DestinationMedia, MediaAsset } from "@/lib/media/types";
import { cn } from "@/lib/utils";
import MediaAttribution from "./MediaAttribution";
import EnvironmentalEffectLayer from "./EnvironmentalEffectLayer";

function useMotionPreference() {
  const [reduced, setReduced] = useState(false);
  const [saveData, setSaveData] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    setSaveData(Boolean(conn?.saveData) || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g");
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return { reduced, saveData };
}

/**
 * Cinematic destination hero: responsive art direction (desktop/mobile),
 * optional ambient video, Ken Burns + parallax + environmental layers,
 * graceful poster/image fallback chain, accessible controls.
 */
export default function CinematicHeroMedia({
  media,
  destinationName,
  priority = false,
  className,
  kenBurns = true,
}: {
  media: DestinationMedia | null;
  destinationName: string;
  priority?: boolean;
  className?: string;
  kenBurns?: boolean;
}) {
  const { reduced, saveData } = useMotionPreference();
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [videoFailed, setVideoFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState(0);

  const hero = media?.hero;
  const mobileHero = media?.mobileHero;
  const showVideo = Boolean(media?.heroVideo && !reduced && !saveData && !videoFailed);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = wrapRef.current?.getBoundingClientRect().top ?? 0;
        setParallax(Math.max(-24, Math.min(24, y * -0.04)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  const markFailed = (id: string) => setFailed((prev) => new Set(prev).add(id));
  const alive = (a?: MediaAsset) => Boolean(a && !failed.has(a.id));

  const renderImage = (asset: MediaAsset, sizes: string, mobile = false) => {
    const isUnsplashApi = asset.source === "unsplash";
    if (isUnsplashApi) {
      // Required hotlinking: API-returned photo.urls with responsive sizing.
      return (
        <img
          src={sizeUnsplash(asset.src, mobile ? 768 : 1920)}
          srcSet={heroSrcSet(asset.src)}
          sizes={sizes}
          alt={asset.alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => markFailed(asset.id)}
          className={cn(
            "h-full w-full object-cover object-center",
            kenBurns && !reduced && "animate-image-zoom"
          )}
        />
      );
    }
    return (
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        priority={priority}
        sizes={sizes}
        onError={() => markFailed(asset.id)}
        className={cn("object-cover object-center", kenBurns && !reduced && "animate-image-zoom")}
      />
    );
  };

  return (
    <div ref={wrapRef} className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden={false}>
      <div
        className="absolute inset-0 will-change-transform"
        style={reduced ? undefined : { transform: `translateY(${parallax}px) scale(1.04)` }}
      >
        {showVideo && media?.heroVideo ? (
          <video
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            poster={media.heroPoster?.src ?? hero?.src}
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover object-center"
            aria-label={`${destinationName} ambient video`}
          >
            <source src={media.heroVideo.src} type="video/mp4" />
          </video>
        ) : (
          <>
            {/* Mobile art direction: landmark-first crop, not a squeezed desktop frame */}
            {alive(mobileHero) && (
              <div className="absolute inset-0 md:hidden">
                {renderImage(mobileHero as MediaAsset, "100vw", true)}
              </div>
            )}
            <div className={cn("absolute inset-0", alive(mobileHero) && "hidden md:block")}>
              {alive(hero) ? (
                renderImage(hero as MediaAsset, "(max-width: 768px) 100vw, 1920px")
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" role="img" aria-label={`${destinationName} backdrop`} />
              )}
            </div>
          </>
        )}
      </div>

      <EnvironmentalEffectLayer effects={media?.effects} />
    </div>
  );
}

export function HeroAttribution({ media, className }: { media: DestinationMedia | null; className?: string }) {
  if (!media?.hero) return null;
  return (
    <div className={cn("absolute bottom-2 right-2 z-20 max-w-[70%] rounded-lg bg-navy-950/55 backdrop-blur-sm", className)}>
      <MediaAttribution asset={media.hero} compact />
    </div>
  );
}
