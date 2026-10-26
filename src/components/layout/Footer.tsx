import Link from "next/link";
import { Mail, Phone, Printer } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { SITE, phoneHref } from "@/lib/site";

const SHOP_LINKS = [
  { href: "/shop/rheumatology", label: "Rheumatology" },
  { href: "/shop/orthopedic-injections", label: "Orthopedic injections" },
  { href: "/shop/dermal-fillers", label: "Dermal fillers" },
  { href: "/shop/botulinum-toxins", label: "Botulinum toxins" },
  { href: "/peptides", label: "Peptides" },
  { href: "/shop", label: "All categories" },
];

const ACCOUNT_LINKS = [
  { href: "/auth/login", label: "Sign in" },
  { href: "/auth/signup", label: "Create an account" },
  { href: "/account/orders", label: "Order history" },
  { href: "/trade/terms", label: "Net-30 terms" },
  { href: "/wishlist", label: "Wishlist" },
];

const SUPPORT_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/blog", label: "Blog" },
  { href: "/referral", label: "Referral & rewards" },
  { href: "/shipping", label: "Shipping & cold-chain" },
  { href: "/returns", label: "Returns & recalls" },
  { href: "/authenticity", label: "Authenticity policy" },
  { href: "/contact", label: "Contact us" },
  { href: "/faq", label: "FAQ" },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-line pt-14 pb-8">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-9 pb-10 border-b border-line">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex">
              <Logo />
            </Link>
            <p className="text-[14px] text-ink-soft max-w-[36ch] leading-relaxed mt-4">
              {SITE.tagline} for licensed professionals. Authentic brand-name stock, shipped
              cold-chain nationwide.
            </p>
            <div className="flex flex-col gap-2.5 mt-5 text-[13.5px] text-ink-soft">
              {SITE.phone && (
                <a href={phoneHref(SITE.phone)} className="inline-flex gap-2.5 items-center hover:text-brand transition-colors">
                  <Phone size={15} className="text-brand" />
                  {SITE.phone}
                </a>
              )}
              {SITE.fax && (
                <span className="inline-flex gap-2.5 items-center">
                  <Printer size={15} className="text-brand" />
                  Fax {SITE.fax}
                </span>
              )}
              <a href={`mailto:${SITE.email}`} className="inline-flex gap-2.5 items-center hover:text-brand transition-colors">
                <Mail size={15} className="text-brand" />
                {SITE.email}
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={SHOP_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
          <FooterColumn title="Support" links={SUPPORT_LINKS} />
        </div>

        <div className="flex flex-wrap justify-between gap-4 pt-6 text-[12.5px] text-ink-faint">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span className="flex gap-5">
            <Link href="/legal/privacy" className="hover:text-brand transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-brand transition-colors">Terms</Link>
            <Link href="/legal/licensing" className="hover:text-brand transition-colors">Licensing</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-ink mb-4">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-[13.5px] text-ink-soft hover:text-brand transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
