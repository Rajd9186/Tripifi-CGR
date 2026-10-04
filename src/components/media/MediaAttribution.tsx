import { withUtm } from "@/lib/media/media-utils";
import type { MediaAsset } from "@/lib/media/types";
import { cn } from "@/lib/utils";

/**
 * Unsplash attribution. Rendered visibly (not hover-only) with required
 * photographer + Unsplash links and UTM parameters.
 */
export default function MediaAttribution({
  asset,
  className,
  compact = false,
}: {
  asset: MediaAsset;
  className?: string;
  compact?: boolean;
}) {
  if (asset.source !== "unsplash" || !asset.photographer) return null;
  return (
    <p
      className={cn(
        "pointer-events-auto text-[11px] leading-tight text-white/75",
        compact ? "px-3 py-1.5" : "px-3 py-2",
        className
      )}
    >
      Photo by{" "}
      <a
        href={withUtm(asset.photographer.profileUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-white/40 underline-offset-2 hover:text-white"
      >
        {asset.photographer.name}
      </a>{" "}
      on{" "}
      <a
        href={withUtm(asset.sourceUrl ?? "https://unsplash.com")}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-white/40 underline-offset-2 hover:text-white"
      >
        Unsplash
      </a>
    </p>
  );
}
