"use client";

import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "primary"
  | "navy"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "saffron"
  | "cyan"
  | "violet";

type ButtonSize = "default" | "sm" | "md" | "lg" | "xl" | "icon";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  glow?: boolean;
  asChild?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  whileTap?: any;
  whileHover?: any;
  whileFocus?: any;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 touch-target";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-gradient-to-r from-saffron-400 to-orange-500 text-bg shadow-glow hover:from-saffron-500 hover:to-orange-600 active:scale-[0.98]",
  primary:
    "bg-gradient-to-r from-saffron-400 to-orange-500 text-bg shadow-glow hover:from-saffron-500 hover:to-orange-600 active:scale-[0.98]",
  navy: "bg-bg-elevated text-text border border-border hover:bg-surface-hover active:scale-[0.98]",
  destructive:
    "bg-error text-white hover:bg-red-600 hover:shadow-red-500/30 active:scale-[0.98]",
  outline:
    "border border-border-strong bg-transparent text-text hover:bg-surface-hover hover:border-saffron/50 active:scale-[0.98]",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface-hover hover:border-border-strong active:scale-[0.98]",
  ghost: "bg-transparent text-text hover:bg-surface-hover active:scale-[0.98]",
  link: "bg-transparent text-saffron underline-offset-4 hover:underline active:scale-[0.98]",
  saffron:
    "bg-gradient-to-r from-saffron-400 to-orange-500 text-bg shadow-glow hover:from-saffron-500 hover:to-orange-600 active:scale-[0.98]",
  cyan: "bg-gradient-to-r from-cyan to-cyan-glow text-bg shadow-glow-cyan active:scale-[0.98]",
  violet: "bg-gradient-to-r from-violet to-violet-glow text-white shadow-glow-violet active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-6 py-2 text-body-sm",
  sm: "h-11 px-4 text-body-sm",
  md: "h-11 px-5 text-body-sm",
  lg: "h-12 px-8 text-body",
  xl: "h-14 px-10 text-heading-md",
  icon: "h-11 w-11",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading,
      glow,
      asChild,
      href,
      children,
      disabled,
      type = "button",
      whileTap,
      whileHover,
      whileFocus,
      initial,
      animate,
      exit,
      transition,
      ...props
    },
    ref
  ) => {
    const glowStyles = glow
      ? "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500"
      : "";

    const classes = cn(
      baseStyles,
      variantStyles[variant] ?? variantStyles.default,
      sizeStyles[size] ?? sizeStyles.default,
      glowStyles,
      className
    );

    const content = (
      <>
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </>
    );

    if (href && !disabled) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        whileTap={whileTap}
        whileHover={whileHover}
        whileFocus={whileFocus}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        {...(props as any)}
      >
        {content}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export const ButtonPrimitive = Button;

export default Button;
