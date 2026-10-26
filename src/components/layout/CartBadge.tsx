"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CartBadge() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="relative inline-flex items-center gap-2 rounded-full bg-brand text-white px-3.5 py-2 text-[13.5px] font-medium hover:bg-brand-deep transition-colors"
    >
      <ShoppingBag size={16} />
      <span className="hidden sm:inline">Cart</span>
      <span className="tabular text-[11px] bg-white/20 rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
        {count}
      </span>
    </Link>
  );
}
