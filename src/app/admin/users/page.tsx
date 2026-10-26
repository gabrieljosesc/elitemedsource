import Link from "next/link";
import { Search } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { ResetPasswordButton, ToggleRoleButton } from "@/components/admin/UserRowActions";

export const metadata = { title: "Users — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim().toLowerCase();
  const adminUser = await getAdminUser();

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, first_name, last_name, phone, company, role, license_number, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  const rows = (profiles ?? []).filter((p) => {
    if (!q) return true;
    const haystack = [p.email, p.first_name, p.last_name, p.phone, p.company, p.license_number]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display font-semibold text-[28px] tracking-tight">Users</h1>
          <p className="text-[14px] text-ink-soft mt-1">
            {rows.length} account{rows.length !== 1 ? "s" : ""}
            {q ? ` matching “${q}”` : ""}
          </p>
        </div>
        <form method="get" className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, license #"
              className="border border-line rounded-lg pl-8.5 pr-3 py-2 text-[13.5px] bg-card outline-none focus:border-brand transition-colors w-[260px]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand text-white font-medium text-[13px] px-4 hover:bg-brand-deep transition-colors"
          >
            Search
          </button>
          {q && (
            <Link
              href="/admin/users"
              className="inline-flex items-center border border-line-strong rounded-lg px-3.5 text-[13px] text-ink hover:border-brand hover:text-brand transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="bg-card border border-line rounded-xl overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left font-sans text-[10.5px] tracking-wide uppercase text-ink-faint px-4 py-3">Name</th>
              <th className="text-left font-sans text-[10.5px] tracking-wide uppercase text-ink-faint px-4 py-3">Email</th>
              <th className="text-left font-sans text-[10.5px] tracking-wide uppercase text-ink-faint px-4 py-3">License #</th>
              <th className="text-left font-sans text-[10.5px] tracking-wide uppercase text-ink-faint px-4 py-3">Company</th>
              <th className="text-left font-sans text-[10.5px] tracking-wide uppercase text-ink-faint px-4 py-3">Role</th>
              <th className="text-left font-sans text-[10.5px] tracking-wide uppercase text-ink-faint px-4 py-3">Joined</th>
              <th className="text-right font-sans text-[10.5px] tracking-wide uppercase text-ink-faint px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => {
              const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
              return (
                <tr key={u.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-brand hover:underline">
                      {name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 font-sans tabular text-[12.5px] text-ink-soft">{u.license_number ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.company ?? "—"}</td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="font-sans text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full bg-brand text-white">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[12.5px] text-ink-faint">Customer</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-4">
                    <ResetPasswordButton userId={u.id} />
                    <ToggleRoleButton userId={u.id} currentRole={u.role} isSelf={u.id === adminUser?.id} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-faint">
                  No accounts found{q ? ` for “${q}”` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
