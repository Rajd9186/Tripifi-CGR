"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "danger"
  | "outline"
  | "success"
  | "warning"
  | "info"
  | "cyan"
  | "violet"
  | "saffron";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  dotColor?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface text-text-muted border border-border",
  secondary: "bg-surface-hover text-text-muted border border-border",
  destructive: "bg-error/15 text-error border border-error/30",
  danger: "bg-error/15 text-error border border-error/30",
  outline: "bg-transparent text-text-muted border border-border-strong",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  info: "bg-cyan/15 text-cyan border border-cyan/30",
  cyan: "bg-cyan/15 text-cyan border border-cyan/30",
  violet: "bg-violet/15 text-violet border border-violet/30",
  saffron: "bg-saffron/15 text-saffron border border-saffron/30",
};

const sizeClasses = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-caption",
  lg: "px-4 py-1.5 text-body-sm",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", dot, dotColor, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors duration-200",
        variantClasses[variant] ?? variantClasses.default,
        sizeClasses[size] ?? sizeClasses.sm,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor || "currentColor" }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
);
Badge.displayName = "Badge";

export default Badge;
