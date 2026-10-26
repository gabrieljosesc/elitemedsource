"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function FloatingCart() {
  const { count } = useCart();
  const pathname = usePathname();

  const hidden =
    count === 0 ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/admin");

  if (hidden) return null;

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="md:hidden fixed bottom-5 right-5 z-50 inline-flex items-center justify-center w-[52px] h-[52px] rounded-full bg-brand text-white shadow-[0_10px_24px_-8px_rgba(15,23,42,0.5)] hover:bg-brand-deep transition-colors"
    >
      <ShoppingCart size={20} />
      <span className="absolute -top-1 -right-1 font-sans tabular text-[10px] bg-low text-white rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
