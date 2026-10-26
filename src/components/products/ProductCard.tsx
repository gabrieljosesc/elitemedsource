import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/types";
import AddToCartButton from "@/components/products/AddToCartButton";
import WishlistButton from "@/components/products/WishlistButton";

const STOCK_COPY: Record<CatalogProduct["stockLabel"], string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const { stockLabel, isFree } = product;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-card border border-line rounded-2xl overflow-hidden flex flex-col hover:border-brand/40 hover:shadow-soft hover:-translate-y-0.5 transition-all"
    >
      <div className="h-[180px] bg-surface relative flex items-center justify-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-[34px] h-[74px] border-[1.5px] border-brand rounded-md bg-brand/10 relative">
            <span className="absolute left-1.5 right-1.5 top-3 h-0.5 bg-brand opacity-55 shadow-[0_7px_0_var(--color-brand),0_14px_0_var(--color-brand)]" />
          </div>
        )}
        <span
          className={`absolute top-2.5 left-2.5 z-10 text-[10.5px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
            stockLabel === "in-stock"
              ? "bg-stock-bg text-stock"
              : stockLabel === "low-stock"
                ? "bg-low-bg text-low"
                : "bg-card border border-line text-ink-faint"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              stockLabel === "in-stock" ? "bg-stock" : stockLabel === "low-stock" ? "bg-low" : "bg-ink-faint"
            }`}
          />
          {STOCK_COPY[stockLabel]}
        </span>
        {isFree && (
          <span className="absolute bottom-2.5 left-2.5 z-10 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-stock text-white">
            Free
          </span>
        )}
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute top-2 right-2 z-10 bg-card/90 border border-line rounded-full p-1.5"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5 truncate">
          {product.categoryLabel}
          {product.sku ? ` · ${product.sku}` : ""}
        </div>
        <h3 className="font-display font-semibold text-[15.5px] tracking-tight leading-snug line-clamp-2">{product.name}</h3>
        {product.brand && <div className="text-[12.5px] text-ink-faint mt-0.5">{product.brand}</div>}
        {product.specLine && (
          <div className="tabular text-[12px] text-ink-soft mt-2 line-clamp-1">{product.specLine}</div>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between gap-2.5">
          {isFree ? (
            <span className="tabular text-[18px] text-stock font-semibold">FREE</span>
          ) : (
            <span className="tabular text-[18px] font-display font-bold text-ink">{formatPrice(product.price)}</span>
          )}
          <AddToCartButton
            product={product}
            className="rounded-full bg-brand-tint text-brand px-3.5 py-2 text-[12.5px] font-medium hover:bg-brand hover:text-white transition-colors"
          >
            Add
          </AddToCartButton>
        </div>
      </div>
    </Link>
  );
}
