"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { ShopFilterOption } from "@/lib/shop-products";
import Logo from "@/components/layout/Logo";

export default function MobileMenu({
  categories,
  signedIn,
}: {
  categories: ShopFilterOption[];
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Keep the page from scrolling behind the open drawer.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const link =
    "block rounded-lg px-3 py-2.5 text-[14px] text-ink-soft hover:bg-surface hover:text-ink transition-colors";
  const heading = "eyebrow px-3 pt-5 pb-1.5";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex items-center justify-center rounded-full w-10 h-10 text-ink hover:bg-surface transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Rendered at the body: the sticky header's backdrop-blur would
          otherwise become the containing block and clip the drawer. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={close} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-card shadow-2xl overflow-y-auto px-2">
            <div className="flex items-center justify-between px-3 py-4 border-b border-line">
              <Logo />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="rounded-full w-9 h-9 inline-flex items-center justify-center text-ink-faint hover:bg-surface hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className={heading}>Shop by category</p>
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop/${c.slug}`} onClick={close} className={link}>
                {c.name}
              </Link>
            ))}
            <Link href="/shop" onClick={close} className={`${link} text-brand font-medium`}>
              All products →
            </Link>

            <p className={heading}>Company</p>
            <Link href="/about" onClick={close} className={link}>About us</Link>
            <Link href="/faq" onClick={close} className={link}>FAQ</Link>
            <Link href="/shipping" onClick={close} className={link}>Shipping</Link>
            <Link href="/contact" onClick={close} className={link}>Contact us</Link>

            <p className={heading}>Account</p>
            {signedIn ? (
              <>
                <Link href="/account/profile" onClick={close} className={link}>My account</Link>
                <Link href="/account/orders" onClick={close} className={link}>My orders</Link>
                <Link href="/wishlist" onClick={close} className={link}>Wishlist</Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={close} className={link}>Sign in</Link>
                <Link href="/auth/signup" onClick={close} className={`${link} text-brand font-medium`}>
                  Create an account
                </Link>
              </>
            )}
            <div className="h-6" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
