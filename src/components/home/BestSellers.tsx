import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import type { CatalogProduct } from "@/lib/types";

export default function BestSellers({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="pb-14 sm:pb-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex justify-between items-end gap-6 flex-wrap mb-8">
          <div>
            <p className="eyebrow">Best sellers</p>
            <h2 className="font-display font-bold text-[28px] sm:text-[36px] tracking-tight mt-2 text-balance">
              What clinics reorder most.
            </h2>
            <p className="text-ink-soft text-[15px] max-w-[52ch] mt-2">
              Trade pricing shown. Sign in to your account for volume tiers and contract rates.
            </p>
          </div>
          <Link
            href="/shop?sort=best-selling"
            className="text-[13.5px] font-medium text-brand inline-flex gap-1.5 items-center whitespace-nowrap hover:text-brand-deep transition-colors"
          >
            View best sellers
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
