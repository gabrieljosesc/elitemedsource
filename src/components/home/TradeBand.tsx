import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";

const STEPS = [
  {
    n: "1",
    title: "Create your account",
    body: "Register with your practice and medical-license details — reviewed within one business day.",
  },
  {
    n: "2",
    title: "See trade pricing",
    body: "Contract rates and volume tiers appear across the full catalog.",
  },
  {
    n: "3",
    title: "Order cold-chain",
    body: "Temperature-controlled dispatch within 24 hours, fully tracked.",
  },
];

export default function TradeBand() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="bg-brand text-white rounded-3xl px-6 sm:px-12 py-10 sm:py-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center overflow-hidden relative">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-[11.5px] font-semibold tracking-[0.1em] uppercase text-white/70">
              For licensed professionals
            </p>
            <h2 className="font-display font-bold text-[28px] sm:text-[40px] tracking-tight mt-3 text-balance">
              Wholesale pricing, once you&apos;re verified.
            </h2>
            <p className="text-white/80 text-[16px] max-w-[44ch] mt-4 leading-relaxed">
              {SITE.name} supplies credentialed clinics and practitioners only. Verify your
              license once and unlock trade pricing, volume tiers, and net-30 terms.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white text-brand-deep font-medium text-[15px] px-6 py-3.5 mt-7 hover:bg-brand-tint transition-colors"
            >
              Create an account
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative flex flex-col gap-3">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 flex gap-4 items-start">
                <span className="text-[13px] font-semibold text-white bg-white/15 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <div>
                  <div className="text-[15px] font-semibold mb-0.5">{s.title}</div>
                  <div className="text-[13px] text-white/75 leading-relaxed">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
