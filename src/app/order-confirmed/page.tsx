import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = { title: "Order confirmed" };

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-[560px] px-5 py-24 text-center">
      <CheckCircle2 size={44} className="text-stock mx-auto mb-5" />
      <p className="eyebrow">Order received</p>
      <h1 className="font-display font-semibold text-[30px] tracking-tight mt-2 mb-4">Thank you for your order.</h1>

      {ref && (
        <div className="inline-block bg-brand-tint border border-line rounded-lg px-5 py-3 mb-6">
          <span className="font-sans text-[11px] tracking-wide uppercase text-ink-faint">Reference number</span>
          <div className="font-sans tabular text-[20px] text-brand font-medium">{ref}</div>
        </div>
      )}

      <p className="text-[14.5px] text-ink-soft mb-9 max-w-[42ch] mx-auto leading-relaxed">
        Our team will review your order and process payment on your card on file. You&apos;ll receive a
        confirmation once it&apos;s approved and dispatched cold-chain.
      </p>

      <Link
        href="/shop"
        className="inline-flex items-center gap-2 rounded-lg bg-brand text-white font-medium text-[14.5px] px-5.5 py-3.5 hover:bg-brand-deep transition-colors"
      >
        Continue shopping
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
