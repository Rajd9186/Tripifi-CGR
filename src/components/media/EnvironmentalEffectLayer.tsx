import type { EnvironmentalEffect } from "@/lib/media/types";
import { cn } from "@/lib/utils";

/**
 * CSS-only environmental motion. Subtle by design; disabled entirely under
 * prefers-reduced-motion via the global stylesheet.
 */
const LAYERS: Record<EnvironmentalEffect, string> = {
  clouds:
    "bg-[radial-gradient(ellipse_60%_22%_at_20%_12%,rgba(255,255,255,0.14),transparent_70%),radial-gradient(ellipse_50%_18%_at_75%_20%,rgba(255,255,255,0.10),transparent_70%)] animate-parallax",
  mist: "bg-[linear-gradient(180deg,transparent_55%,rgba(226,232,240,0.10)_78%,rgba(226,232,240,0.16)_100%)]",
  water:
    "bg-[radial-gradient(ellipse_70%_30%_at_50%_108%,rgba(27,154,170,0.22),transparent_70%)] animate-float-soft",
  light:
    "bg-[radial-gradient(ellipse_45%_35%_at_82%_8%,rgba(255,214,150,0.16),transparent_70%)]",
  dust: "bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(242,140,40,0.08),transparent_70%)] animate-float-soft",
  snow: "bg-[radial-gradient(circle_1.5px_at_12%_22%,rgba(255,255,255,0.7),transparent_60%),radial-gradient(circle_1px_at_68%_14%,rgba(255,255,255,0.5),transparent_60%),radial-gradient(circle_1.5px_at_84%_34%,rgba(255,255,255,0.6),transparent_60%)]",
  haze: "bg-[linear-gradient(180deg,rgba(189,214,238,0.10),transparent_45%)]",
};

export default function EnvironmentalEffectLayer({
  effects,
  className,
}: {
  effects?: EnvironmentalEffect[];
  className?: string;
}) {
  if (!effects || effects.length === 0) return null;
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {effects.map((e) => (
        <div key={e} className={cn("absolute inset-0", LAYERS[e])} />
      ))}
    </div>
  );
}
