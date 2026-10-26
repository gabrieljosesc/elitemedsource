import Link from "next/link";
import { getTopBrands, type TopBrand } from "@/lib/shop-products";

export default async function Brands() {
  const brands = await getTopBrands(12);
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface overflow-hidden">
      <div className="py-10">
        <div className="text-center eyebrow mb-6">Trusted brands we carry</div>

        <div className="group relative">
          <div
            className="flex w-max gap-3 motion-safe:animate-[brand-marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]"
            aria-label="Brands we carry"
          >
            <BrandCards brands={brands} />
            <BrandCards brands={brands} ariaHidden />
          </div>

          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-surface to-transparent" />
        </div>
      </div>
    </section>
  );
}

function BrandCards({ brands, ariaHidden }: { brands: TopBrand[]; ariaHidden?: boolean }) {
  return (
    <div className="flex gap-3" aria-hidden={ariaHidden || undefined}>
      {brands.map((brand) => (
        <Link
          key={`${brand.slug}${ariaHidden ? "-copy" : ""}`}
          href={`/shop?brand=${brand.slug}`}
          tabIndex={ariaHidden ? -1 : undefined}
          className="w-[190px] shrink-0 bg-card border border-line rounded-2xl px-5 py-5 text-center hover:border-brand/50 hover:shadow-soft transition-all"
        >
          <span className="block font-display font-semibold text-[18px] leading-tight text-ink tracking-tight">
            {brand.name}
          </span>
          <span className="block tabular text-[12px] text-ink-soft mt-2">
            <span className="text-brand font-medium">{brand.count}</span> products
          </span>
        </Link>
      ))}
    </div>
  );
}
