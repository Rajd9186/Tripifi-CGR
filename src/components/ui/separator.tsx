"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: "default" | "dashed" | "gradient";
}

const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
  ({ className, variant = "default", orientation = "horizontal", decorative = true, ...props }, ref) => {
    const variants = {
      default: "bg-border",
      dashed: "bg-border border-t-[1px] border-dashed",
      gradient: "bg-gradient-to-r from-transparent via-border to-transparent",
    };

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0",
          orientation === "horizontal" ? "w-full h-px" : "h-full w-px",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };