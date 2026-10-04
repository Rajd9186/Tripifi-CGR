"use client";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { HeartIcon } from "@/components/icons/BookingIcons";

export default function WishlistButton({ id, label, className, dark = false }: { id: string; label: string; className?: string; dark?: boolean }) {
  const { wishlist, toggleWishlist } = useApp();
  const saved = wishlist.includes(id);
  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${label} from wishlist` : `Save ${label} to wishlist`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id);
      }}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full shadow-sm backdrop-blur transition-all",
        dark ? "bg-navy-950/55 text-white hover:bg-navy-950/75" : "bg-white/95 text-ink-700 hover:text-saffron-600",
        saved && !dark && "text-saffron-600",
        className
      )}
    >
      <HeartIcon className="w-5 h-5" filled={saved} />
    </button>
  );
}
