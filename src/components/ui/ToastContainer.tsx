"use client";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 top-[76px] z-toast flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:top-20 sm:items-end"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex w-full max-w-[92vw] items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-lift sm:max-w-md",
            toast.type === "success" && "bg-leaf-600 text-white",
            toast.type === "error" && "bg-red-600 text-white",
            toast.type === "info" && "bg-navy-900 text-white"
          )}
        >
          <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
