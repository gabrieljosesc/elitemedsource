"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/supabase/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email/auth-emails";

export type AdminUserResult = { ok: true; message?: string } | { ok: false; message: string };

export async function sendUserPasswordReset(userId: string): Promise<AdminUserResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { ok: false, message: "Admin access required." };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();
  if (!profile?.email) return { ok: false, message: "That user has no email on file." };

  const h = await headers();
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const origin =
    envUrl && !/localhost|127\.0\.0\.1/.test(envUrl)
      ? envUrl
      : (h.get("origin") ?? `https://${h.get("host")}`);

  // Same path as the customer-facing "forgot password": mint the recovery
  // token here and send it through our own transport (SMTP / Resend), which
  // isn't subject to Supabase's built-in mailer limits.
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: profile.email });
  if (!error && data.properties?.hashed_token) {
    const resetUrl =
      `${origin}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}` +
      `&type=recovery&next=${encodeURIComponent("/auth/update-password")}`;
    const sent = await sendPasswordResetEmail(profile.email, resetUrl);
    if (sent.ok) return { ok: true, message: `Reset email sent to ${profile.email}` };
    console.error("[sendUserPasswordReset] reset email failed:", sent.error);
  } else if (error) {
    console.error("[sendUserPasswordReset] generateLink:", error.message);
  }

  // Fallback: Supabase's built-in mailer.
  const supabase = await createClient();
  const { error: resendError } = await supabase.auth.resetPasswordForEmail(profile.email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (resendError) {
    return {
      ok: false,
      message: `Couldn't send the reset email (${resendError.message}). Check the SMTP / Resend settings.`,
    };
  }
  return { ok: true, message: `Reset email sent to ${profile.email}` };
}

export async function setUserRole(userId: string, role: "customer" | "admin"): Promise<AdminUserResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { ok: false, message: "Admin access required." };
  if (userId === adminUser.id) return { ok: false, message: "You can't change your own role." };
  if (role !== "customer" && role !== "admin") return { ok: false, message: "Invalid role." };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, message: "Couldn't update the role. Please try again." };

  revalidatePath("/admin/users");
  return { ok: true, message: role === "admin" ? "Promoted to admin." : "Set to customer." };
}
