import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/auth";

export const metadata = { title: "Admin" };

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    redirect("/");
  }

  return (
    <div>
      <div className="bg-ink text-white">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 flex items-center gap-6 py-3 overflow-x-auto">
          <Link href="/admin" className="text-[11.5px] font-semibold tracking-[0.12em] uppercase text-white/60 whitespace-nowrap">
            Admin
          </Link>
          <nav className="flex items-center gap-1">
            {ADMIN_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13.5px] font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="ml-auto text-[13px] text-white/60 hover:text-white transition-colors whitespace-nowrap"
          >
            ← Storefront
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10">{children}</div>
    </div>
  );
}
