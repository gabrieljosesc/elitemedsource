"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistBadge() {
  const { count } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className="relative hidden sm:inline-flex items-center justify-center rounded-full w-10 h-10 text-ink hover:bg-surface transition-colors"
    >
      <Heart size={18} />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 tabular text-[9.5px] font-semibold bg-low text-white rounded-full px-1 py-0.5 leading-none min-w-[16px] text-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
