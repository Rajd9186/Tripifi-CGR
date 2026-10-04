import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  padding?: "sm" | "md" | "lg";
}

export default function Card({
  children,
  className,
  title,
  subtitle,
  padding = "md",
}: CardProps) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      {(title || subtitle) && (
        <div className="border-b border-ink-100 px-6 py-5">
          {title && (
            <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-ink-600">{subtitle}</p>
          )}
        </div>
      )}
      <div
        className={cn(
          padding === "sm" && "p-4",
          padding === "md" && "p-6",
          padding === "lg" && "p-8"
        )}
      >
        {children}
      </div>
    </div>
  );
}
