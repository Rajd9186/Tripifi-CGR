"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "outlined" | "glass" | "glass-hover" | "premium";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  title?: string;
  subtitle?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-bg-elevated border border-border",
  elevated: "bg-surface-active border border-border-strong shadow-card-hover",
  outlined: "bg-transparent border border-border-strong",
  glass: "glass",
  "glass-hover": "glass-hover",
  premium: "card-premium",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", padding = "md", hover = false, title, subtitle, children, ...props },
    ref
  ) => {
    const hasHeader = Boolean(title || subtitle);
    const pad = paddingClasses[padding] ?? "";
    const hoverStyles = hover
      ? "transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl",
          variantClasses[variant] ?? variantClasses.default,
          hasHeader ? "overflow-hidden" : pad,
          hoverStyles,
          className
        )}
        {...props}
      >
        {hasHeader ? (
          <>
            <div className="border-b border-ink-100 px-6 py-5">
              {title && (
                <h3 className="font-display text-base font-semibold text-text">{title}</h3>
              )}
              {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
            </div>
            <div className={pad}>{children}</div>
          </>
        ) : (
          children
        )}
      </div>
    );
  }
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-display text-heading-lg font-semibold tracking-tight text-text", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-body-sm text-text-muted", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export default Card;
