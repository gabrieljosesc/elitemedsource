import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, ClipboardCheck } from "lucide-react";
import type { HeroProduct } from "@/lib/home-data";
import HeroCarousel from "@/components/home/HeroCarousel";

export default function Hero({ products }: { products: HeroProduct[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-tint/70 via-ground to-ground">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 pt-12 sm:pt-20 pb-12 sm:pb-20 grid lg:grid-cols-[1.1fr_.9fr] gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-card border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-soft shadow-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-stock" />
            Rheumatology-focused supplier for licensed clinics
          </span>
          <h1 className="font-display font-bold text-[40px] sm:text-[56px] lg:text-[64px] leading-[1.05] tracking-tight text-balance mt-5">
            Rheumatology biologics at <span className="text-brand">true trade prices.</span>
          </h1>
          <p className="text-[17px] sm:text-[18px] text-ink-soft max-w-[46ch] mt-5 mb-8 leading-relaxed">
            Actemra, Cimzia, Orencia, Remicade, and the specialty injectables your practice
            reorders — plus orthopedic, aesthetic, and peptide lines — sourced authentic and
            shipped cold-chain nationwide.
          </p>

          <div className="flex gap-3 flex-wrap mb-8">
            <Link
              href="/shop/rheumatology"
              className="inline-flex items-center gap-2 rounded-full bg-brand text-white font-medium text-[15px] px-6 py-3.5 hover:bg-brand-deep transition-colors shadow-soft"
            >
              Shop rheumatology
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-card border border-line text-ink font-medium text-[15px] px-6 py-3.5 hover:border-line-strong hover:bg-surface transition-colors"
            >
              Browse the full catalog
            </Link>
          </div>

          <ul className="flex gap-x-6 gap-y-2 flex-wrap text-[13.5px] text-ink-soft">
            <li className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-brand shrink-0" />
              Verified authentic stock
            </li>
            <li className="flex items-center gap-2">
              <Truck size={17} className="text-brand shrink-0" />
              Temperature-controlled shipping
            </li>
            <li className="flex items-center gap-2">
              <ClipboardCheck size={17} className="text-brand shrink-0" />
              Licensed practitioners only
            </li>
          </ul>
        </div>

        <HeroCarousel products={products} />
      </div>
    </section>
  );
}
