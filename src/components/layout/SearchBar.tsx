"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Suggestion = { id: string; slug: string; name: string; price: number; image: string | null };

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-suggest?q=${encodeURIComponent(q.trim())}`);
        const json = await res.json();
        setResults(json.results ?? []);
        setOpen(true);
      } catch {}
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/shop?search=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="relative hidden md:block flex-1 max-w-[540px]" ref={ref}>
      <form
        onSubmit={submit}
        className="flex items-center gap-2.5 bg-surface border border-line rounded-full pl-4 pr-2 py-1.5 w-full text-ink-faint focus-within:border-brand focus-within:bg-card focus-within:ring-4 focus-within:ring-brand/10 transition-all"
      >
        <Search size={16} className="shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search products, brands, or SKU"
          className="border-0 bg-transparent outline-none text-[14px] text-ink w-full py-1 placeholder:text-ink-faint"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-ink text-white text-[12.5px] font-medium px-3.5 py-1.5 hover:bg-brand transition-colors"
        >
          Search
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-line rounded-2xl shadow-soft py-2 z-50 overflow-hidden">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/product/${r.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 hover:bg-surface transition-colors"
            >
              <span className="w-10 h-10 rounded-lg border border-line bg-card relative overflow-hidden shrink-0">
                {r.image && <Image src={r.image} alt="" fill className="object-contain p-1" sizes="40px" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] text-ink truncate">{r.name}</span>
                <span className="tabular text-[12px] text-ink-soft">{formatPrice(r.price)}</span>
              </span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/shop?search=${encodeURIComponent(q.trim())}`);
            }}
            className="block w-full text-left px-3.5 py-2.5 text-[13px] font-medium text-brand hover:bg-surface transition-colors border-t border-line mt-1"
          >
            See all results for “{q.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}
