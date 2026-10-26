import Link from "next/link";
import {
  Syringe,
  Bone,
  FlaskConical,
  Waves,
  Droplet,
  Sparkles,
  Scale,
  TestTubes,
  Eye,
  HeartPulse,
  Venus,
  Stethoscope,
  ShieldPlus,
  Activity,
  Pill,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { HomeCategory } from "@/lib/home-data";

const ICONS: Record<string, LucideIcon> = {
  rheumatology: HeartPulse,
  ophthalmology: Eye,
  skincare: Sparkles,
  "peels-and-masks": Droplet,
  "dermal-fillers": Syringe,
  "botulinum-toxins": FlaskConical,
  gynecology: Venus,
  "body-sculpting": Scale,
  osteoporosis: Bone,
  "fat-removal": Activity,
  mesotherapy: TestTubes,
  "orthopedic-injections": Bone,
  peptides: FlaskConical,
  "dermal-filler-removal": Syringe,
  anaesthetics: Pill,
  "weight-loss": Scale,
  "cannulas-and-needles": Syringe,
  asthma: Stethoscope,
  threads: Waves,
  "eyelash-enhancers": Sparkles,
  "prp-kits": TestTubes,
  other: ShieldPlus,
};

export default function Categories({ categories }: { categories: HomeCategory[] }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex justify-between items-end gap-6 flex-wrap mb-8">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="font-display font-bold text-[28px] sm:text-[36px] tracking-tight mt-2 text-balance">
              Every category, one supplier.
            </h2>
            <p className="text-ink-soft text-[15px] max-w-[52ch] mt-2">
              From rheumatology injectables to the full aesthetic range — organized the way
              clinics actually order.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-[13.5px] font-medium text-brand inline-flex gap-1.5 items-center whitespace-nowrap hover:text-brand-deep transition-colors"
          >
            All categories
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = ICONS[cat.slug] ?? Syringe;
            return (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="group bg-card border border-line rounded-2xl p-5 flex flex-col min-h-[150px] hover:border-brand/50 hover:shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <span className="w-11 h-11 rounded-xl bg-brand-tint text-brand inline-flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                  <Icon size={22} />
                </span>
                <h3 className="font-display font-semibold text-[17px] tracking-tight mt-auto pt-5">{cat.name}</h3>
                <span className="text-[12.5px] text-ink-soft mt-1 tabular">
                  {cat.productCount} products
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
