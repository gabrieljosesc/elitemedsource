import { Truck, Clock, ShieldCheck, BadgeCheck } from "lucide-react";

const ITEMS = [
  {
    icon: Truck,
    title: "First order ships free",
    body: "Then free at $800+, flat insured rates below that.",
  },
  {
    icon: Clock,
    title: "Dispatched in 24h",
    body: "Cold-chain packed, tracked door to door.",
  },
  {
    icon: ShieldCheck,
    title: "100% authentic",
    body: "Sourced direct, full batch traceability.",
  },
  {
    icon: BadgeCheck,
    title: "Verified accounts",
    body: "Wholesale pricing for credentialed buyers.",
  },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex gap-3.5 items-start bg-card border border-line rounded-2xl px-4 py-4">
            <span className="w-10 h-10 rounded-xl bg-brand-tint text-brand inline-flex items-center justify-center shrink-0">
              <item.icon size={19} />
            </span>
            <div>
              <div className="text-[14px] font-semibold text-ink mb-0.5">{item.title}</div>
              <div className="text-[12.5px] text-ink-soft leading-snug">{item.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
