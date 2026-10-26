import Link from "next/link";
import { Mail, Phone, UserRound } from "lucide-react";
import { getAuthUser, getAdminUser } from "@/lib/supabase/auth";
import { getShopFilterOptions } from "@/lib/shop-products";
import { SITE, phoneHref } from "@/lib/site";
import CartBadge from "@/components/layout/CartBadge";
import SearchBar from "@/components/layout/SearchBar";
import MobileMenu from "@/components/layout/MobileMenu";
import WishlistBadge from "@/components/layout/WishlistBadge";
import AccountMenu from "@/components/layout/AccountMenu";
import CategoriesMenu from "@/components/layout/CategoriesMenu";
import Logo from "@/components/layout/Logo";

const NAV_LINKS = [
  { href: "/shop/rheumatology", label: "Rheumatology" },
  { href: "/shop/orthopedic-injections", label: "Orthopedic" },
  { href: "/shop/dermal-fillers", label: "Dermal fillers" },
  { href: "/shop/botulinum-toxins", label: "Botulinum toxins" },
  { href: "/shop/gynecology", label: "Gynecology" },
  { href: "/peptides", label: "Peptides" },
];

// Categories already pinned in the top bar; the dropdown shows the rest.
const TOP_NAV_SLUGS = new Set([
  "dermal-fillers",
  "botulinum-toxins",
  "rheumatology",
  "orthopedic-injections",
  "gynecology",
  "peptides",
]);

export default async function Navbar() {
  const [user, { categories }] = await Promise.all([getAuthUser(), getShopFilterOptions()]);
  const adminUser = user ? await getAdminUser() : null;
  const firstName =
    (user?.user_metadata?.first_name as string | undefined) || user?.email?.split("@")[0] || "";

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-ink text-white/80 text-[12.5px]">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between gap-6 px-5 sm:px-8 py-2">
          <span className="hidden sm:inline-flex items-center gap-4">
            {SITE.phone && (
              <a href={phoneHref(SITE.phone)} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={13} />
                {SITE.phone}
              </a>
            )}
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} />
              {SITE.email}
            </a>
          </span>
          <span className="w-full sm:w-auto text-center text-white">{SITE.shippingPromise}</span>
          <Link href="/auth/signup" className="hidden sm:inline hover:text-white transition-colors">
            Create a trade account →
          </Link>
        </div>
      </div>

      <header className="bg-ground/95 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-[1200px] flex items-center gap-4 sm:gap-6 px-5 sm:px-8 py-3.5">
          <Link href="/" className="flex shrink-0" aria-label="Elite MedSource home">
            <Logo />
          </Link>

          <SearchBar />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <AccountMenu firstName={firstName} isAdmin={!!adminUser} />
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-ink hover:bg-surface transition-colors"
              >
                <UserRound size={16} className="text-ink-soft" />
                Sign in
              </Link>
            )}

            <WishlistBadge />
            <CartBadge />
            <MobileMenu categories={categories} signedIn={!!user} />
          </div>
        </div>

        <nav className="hidden lg:block border-t border-line">
          <div className="mx-auto max-w-[1200px] flex items-center gap-1 px-5 sm:px-8">
            <CategoriesMenu categories={categories.filter((c) => !TOP_NAV_SLUGS.has(c.slug))} />
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13.5px] font-medium whitespace-nowrap text-ink-soft hover:text-brand px-3 py-2.5 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/shop"
              className="ml-auto text-[13.5px] font-medium whitespace-nowrap text-brand hover:text-brand-deep px-3 py-2.5 transition-colors"
            >
              All products
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
}
