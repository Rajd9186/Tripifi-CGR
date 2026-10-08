"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-text">Turbulence on this page</h1>
      <p className="mt-2 text-text-muted">Something went wrong while loading this screen. Your trips and wishlist are safe.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="min-h-[48px] rounded-full bg-saffron px-6 font-medium text-[#0B1026]">
          Try again
        </button>
        <Link href="/" className="inline-flex min-h-[48px] items-center rounded-full border border-white/20 px-6 font-medium text-text">
          Go home
        </Link>
      </div>
    </div>
  );
}
