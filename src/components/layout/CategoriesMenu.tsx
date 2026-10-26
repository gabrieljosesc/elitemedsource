"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, LayoutGrid } from "lucide-react";
import type { ShopFilterOption } from "@/lib/shop-products";

export default function CategoriesMenu({ categories }: { categories: ShopFilterOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-[13.5px] font-medium whitespace-nowrap px-3 py-2.5 transition-colors ${
          open ? "text-brand" : "text-ink hover:text-brand"
        }`}
      >
        <LayoutGrid size={15} />
        All categories
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-[600px] bg-card border border-line rounded-2xl shadow-soft p-4 z-50">
          <p className="eyebrow px-2 pb-2">Shop by category</p>
          <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2.5 py-2 text-[13.5px] text-ink-soft hover:bg-surface hover:text-brand transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-tint text-brand text-[13.5px] font-medium px-3 py-2.5 hover:bg-brand hover:text-white transition-colors"
          >
            View all products
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
