import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "navy" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}

export default function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  children,
  className,
  type = "button",
}: ButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition hover:active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    size === "sm" && "px-3 py-2 text-sm",
    size === "md" && "px-5 py-3 text-sm",
    size === "lg" && "px-6 py-4 text-base",
    variant === "primary" && "bg-saffron-500 text-white shadow-glow hover:bg-saffron-600",
    variant === "navy" && "bg-navy-900 text-white hover:bg-navy-800",
    variant === "ghost" && "border border-ink-200 bg-white text-ink-800 hover:border-navy-300 hover:bg-navy-50",
    variant === "outline" && "border border-ink-200 bg-transparent text-ink-800 hover:bg-ink-50",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
