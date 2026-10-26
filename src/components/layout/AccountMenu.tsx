"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountMenu({ firstName, isAdmin }: { firstName: string; isAdmin?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const item = "block px-4 py-2 text-[13.5px] text-ink hover:bg-surface transition-colors";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hidden sm:inline-flex items-center gap-2 rounded-full pl-1.5 pr-2.5 py-1.5 hover:bg-surface transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-brand-tint text-brand text-[12px] font-semibold flex items-center justify-center shrink-0">
          {firstName.slice(0, 1).toUpperCase() || "?"}
        </span>
        <span className="text-[13.5px] text-ink font-medium">{firstName}</span>
        <ChevronDown size={14} className={`text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[190px] bg-card border border-line rounded-2xl shadow-soft py-1.5 z-50 overflow-hidden">
          <Link href="/account/profile" onClick={() => setOpen(false)} className={item}>
            My account
          </Link>
          <Link href="/account/orders" onClick={() => setOpen(false)} className={item}>
            My orders
          </Link>
          <Link href="/wishlist" onClick={() => setOpen(false)} className={item}>
            Wishlist
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={`${item} text-brand font-medium border-t border-line mt-1 pt-2.5`}
            >
              Admin panel
            </Link>
          )}
          <button type="button" onClick={handleSignOut} className={`${item} w-full text-left text-ink-soft`}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
