import "server-only";
import { sendTransactionalEmail, type SendEmailResult } from "./send";
import { SITE } from "@/lib/site";

const BRAND = "#2563eb";
const INK = "#0f172a";

function shell(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:${BRAND};padding:18px 24px">
        <span style="color:#ffffff;font-size:19px;font-weight:600">Elite<span style="opacity:.75">MedSource</span></span>
        <span style="color:#bfdbfe;font-size:10px;letter-spacing:2px;margin-left:8px">MEDICAL SUPPLY</span>
      </div>
      <div style="padding:26px 24px;color:${INK}">
        <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
        ${bodyHtml}
        <p style="font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;margin:24px 0 0">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
      <div style="padding:14px 24px;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;font-family:Arial,sans-serif">
        ${SITE.name} · ${SITE.email}${SITE.phone ? ` · ${SITE.phone}` : ""}
      </div>
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  return `
    <p style="margin:20px 0">
      <a href="${href}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:bold;font-family:Arial,sans-serif;font-size:14px;padding:12px 28px;border-radius:8px">${label}</a>
    </p>
    <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#64748b;word-break:break-all">
      Or copy this link into your browser:<br>${href}
    </p>`;
}

const P = `style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#475569;margin:0 0 12px"`;

/** Account-verification email sent after registration (bypasses Supabase's rate-limited built-in mailer). */
export async function sendVerifyEmail(to: string, confirmUrl: string): Promise<SendEmailResult> {
  return sendTransactionalEmail({
    to,
    subject: "Verify your email — Elite MedSource",
    html: shell(
      "Confirm your email address",
      `<p ${P}>Thanks for creating a trade account with Elite MedSource. Click the button below to
       verify your email address and activate your account.</p>
       ${button(confirmUrl, "Verify Email")}`
    ),
    text: `Verify your Elite MedSource account:\n${confirmUrl}\n\nIf you did not create an account, ignore this email.`,
  });
}

/** Password-reset email (bypasses Supabase's rate-limited built-in mailer). */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<SendEmailResult> {
  return sendTransactionalEmail({
    to,
    subject: "Reset your password — Elite MedSource",
    html: shell(
      "Reset your password",
      `<p ${P}>We received a request to reset the password for your account. Click the button below to
       choose a new password.</p>
       ${button(resetUrl, "Reset Password")}`
    ),
    text: `Reset your Elite MedSource password:\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  });
}
