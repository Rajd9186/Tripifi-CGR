import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("card mx-auto max-w-xl px-6 py-12 text-center", className)}>
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-900" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-6 inline-flex min-h-[48px]">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load live availability",
  description = "You can try again or let Tripifi arrange this for you.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("card mx-auto max-w-xl px-6 py-12 text-center", className)} role="alert">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">{description}</p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost inline-flex min-h-[48px]">
            Try Again
          </button>
        )}
        <Link href="/plan" className="btn-primary inline-flex min-h-[48px]">
          Request Assistance
        </Link>
      </div>
    </div>
  );
}
