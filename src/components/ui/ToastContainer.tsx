"use client";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 space-y-2 px-4 sm:bottom-auto sm:left-auto sm:right-4 sm:translate-x-0 sm:top-20">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex min-w-[280px] max-w-[90vw] items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-soft sm:max-w-md",
            toast.type === "success" && "bg-leaf-600 text-white",
            toast.type === "error" && "bg-red-600 text-white",
            toast.type === "info" && "bg-navy-900 text-white"
          )}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
