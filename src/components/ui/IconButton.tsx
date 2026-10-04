"use client";

import { cn } from "@/lib/utils";

type IconSize = 16 | 18 | 20 | 24 | 32;

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  size?: IconSize;
  variant?: "ghost" | "solid" | "outline" | "teal" | "saffron";
  active?: boolean;
}

const ICON_PX: Record<IconSize, number> = {
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  32: 32,
};

export function IconSizeWrapper({
  size = 18,
  children,
  className,
}: {
  size?: IconSize;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: ICON_PX[size], height: ICON_PX[size] }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function IconButton({
  icon,
  label,
  size = 18,
  variant = "ghost",
  active = false,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 focus-visible:ring-offset-2 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none",
        variant === "ghost" && "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
        variant === "solid" && "bg-navy-900 text-white hover:bg-navy-800 shadow-soft",
        variant === "outline" && "border border-ink-200 bg-white text-ink-700 hover:border-navy-300 hover:bg-navy-50",
        variant === "teal" && "bg-teal-500 text-white hover:bg-teal-600",
        variant === "saffron" && "bg-saffron-500 text-white hover:bg-saffron-600 shadow-glow",
        active && variant === "ghost" && "bg-navy-50 text-navy-900",
        className
      )}
      {...rest}
    >
      <IconSizeWrapper size={size}>{icon}</IconSizeWrapper>
    </button>
  );
}

export function IconLabel({
  icon,
  children,
  size = 18,
  className,
  iconClassName,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  size?: IconSize;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <IconSizeWrapper size={size} className={cn("text-current", iconClassName)}>
        {icon}
      </IconSizeWrapper>
      <span className="min-w-0">{children}</span>
    </span>
  );
}

export function InputIcon({
  children,
  size = 18,
  className,
}: {
  children: React.ReactNode;
  size?: IconSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute left-0 top-1/2 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center text-ink-400",
        className
      )}
      aria-hidden="true"
    >
      <IconSizeWrapper size={size}>{children}</IconSizeWrapper>
    </span>
  );
}
