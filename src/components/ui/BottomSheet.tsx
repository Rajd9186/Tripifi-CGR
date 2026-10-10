"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] md:flex md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-bg-elevated shadow-card-hover animate-slide-up safe-bottom",
          "md:relative md:inset-auto md:max-h-[80vh] md:w-[520px] md:rounded-2xl md:border md:border-border",
          className
        )}
      >
        <div className="sticky top-0 bg-bg-elevated/95 backdrop-blur px-5 pt-3 pb-4 border-b border-ink-100 rounded-t-3xl md:rounded-t-2xl">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-200 md:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            {title && <h2 className="text-base font-semibold text-ink-900">{title}</h2>}
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ink-500 hover:bg-ink-50 hover:text-ink-900 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
