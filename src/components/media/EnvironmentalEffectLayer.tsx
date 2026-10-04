import type { EnvironmentalEffect } from "@/lib/media/types";
import { cn } from "@/lib/utils";

/**
 * Environmental layers. Static by default — only mist and water breathe,
 * ultra-slowly, on long unsynchronized cycles. Everything else is a fixed
 * atmospheric gradient. Mountains don't move; neither do these overlays.
 */
const STATIC: Record<EnvironmentalEffect, string> = {
  clouds:
    "bg-[radial-gradient(ellipse_60%_22%_at_20%_12%,rgba(255,255,255,0.12),transparent_70%),radial-gradient(ellipse_50%_18%_at_75%_20%,rgba(255,255,255,0.08),transparent_70%)]",
  mist: "bg-[linear-gradient(180deg,transparent_55%,rgba(226,232,240,0.10)_78%,rgba(226,232,240,0.15)_100%)]",
  water: "bg-[radial-gradient(ellipse_70%_30%_at_50%_108%,rgba(27,154,170,0.18),transparent_70%)]",
  light: "bg-[radial-gradient(ellipse_45%_35%_at_82%_8%,rgba(255,214,150,0.14),transparent_70%)]",
  dust: "bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(242,140,40,0.07),transparent_70%)]",
  snow: "bg-[radial-gradient(circle_1.5px_at_12%_22%,rgba(255,255,255,0.6),transparent_60%),radial-gradient(circle_1px_at_68%_14%,rgba(255,255,255,0.45),transparent_60%),radial-gradient(circle_1.5px_at_84%_34%,rgba(255,255,255,0.55),transparent_60%)]",
  haze: "bg-[linear-gradient(180deg,rgba(189,214,238,0.10),transparent_45%)]",
};

/** Layers allowed to move, with their animation + default cycle. */
const ANIMATED: Partial<Record<EnvironmentalEffect, { className: string; defaultDuration: number }>> = {
  mist: { className: "animate-mist-shift", defaultDuration: 37 },
  water: { className: "animate-breathe", defaultDuration: 44 },
};

export default function EnvironmentalEffectLayer({
  effects,
  cycles,
  className,
}: {
  effects?: EnvironmentalEffect[];
  /** Per-layer cycle seconds — deliberately unsynchronized across layers. */
  cycles?: Partial<Record<EnvironmentalEffect, number>>;
  className?: string;
}) {
  if (!effects || effects.length === 0) return null;
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {effects.map((e) => {
        const anim = ANIMATED[e];
        return (
          <div
            key={e}
            className={cn("absolute inset-0", STATIC[e], anim?.className)}
            style={anim ? { animationDuration: `${cycles?.[e] ?? anim.defaultDuration}s` } : undefined}
          />
        );
      })}
    </div>
  );
}
