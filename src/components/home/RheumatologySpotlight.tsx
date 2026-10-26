import Link from "next/link";
import { ArrowRight, Snowflake, ShieldCheck, Stethoscope } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import type { CatalogProduct } from "@/lib/types";

const POINTS = [
  {
    icon: Stethoscope,
    title: "Biologics & DMARDs",
    body: "Actemra, Cimzia, Orencia, Remicade, MabThera, Entyvio, and more.",
  },
  {
    icon: Snowflake,
    title: "Cold-chain from dispatch to door",
    body: "Temperature-logged packing, shipped within 24 hours of approval.",
  },
  {
    icon: ShieldCheck,
    title: "Full batch traceability",
    body: "Sourced through authorized channels with lot and expiry on every unit.",
  },
];

export default function RheumatologySpotlight({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 border-b border-line">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-36">
            <p className="eyebrow">Our focus</p>
            <h2 className="font-display font-bold text-[28px] sm:text-[36px] tracking-tight mt-2 text-balance">
              Rheumatology, supplied properly.
            </h2>
            <p className="text-ink-soft text-[15px] mt-3 leading-relaxed">
              Elite MedSource specializes in rheumatology biologics and infusion products for
              practices and infusion centers, with trade pricing and cold-chain handling on every
              order.
            </p>

            <ul className="mt-6 flex flex-col gap-4">
              {POINTS.map((pt) => (
                <li key={pt.title} className="flex gap-3.5 items-start">
                  <span className="w-9 h-9 rounded-xl bg-brand-tint text-brand inline-flex items-center justify-center shrink-0">
                    <pt.icon size={18} />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-ink">{pt.title}</div>
                    <div className="text-[12.5px] text-ink-soft leading-snug mt-0.5">{pt.body}</div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/shop/rheumatology"
              className="inline-flex items-center gap-2 rounded-full bg-brand text-white font-medium text-[14.5px] px-5.5 py-3 mt-7 hover:bg-brand-deep transition-colors"
            >
              Shop all rheumatology
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
