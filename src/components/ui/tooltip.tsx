"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {}

const Tooltip = ({ children, ...props }: TooltipProps) => {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
};
Tooltip.displayName = TooltipPrimitive.Root.displayName;

interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {}
const TooltipTrigger = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Trigger>, TooltipTriggerProps>(
  ({ className, ...props }, ref) => (
    <TooltipPrimitive.Trigger ref={ref} className={cn("", className)} {...props} />
  )
);
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(
  ({ className, side = "top", align = "center", sideOffset = 8, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-lg bg-bg-elevated border border-border px-3 py-2 text-caption text-text",
        "glass shadow-card-hover",
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <TooltipPrimitive.Arrow className="fill-bg-elevated stroke-border" width={8} height={4} />
    </TooltipPrimitive.Content>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent };