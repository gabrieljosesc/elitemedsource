import { sendTransactionalEmail, adminRecipients } from "@/lib/email/send";
import { formatPrice } from "@/lib/utils";
import { SITE } from "@/lib/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const BRAND = "#17956f";
const BRAND_LIGHT = "#34d399";
const INK = "#0f172a";

type OrderSummary = {
  id: string;
  reference_number: string;
  customer_name: string | null;
  customer_email: string | null;
  subtotal: number;
  shipping_amount?: number | null;
  discount_amount?: number | null;
  coupon_code?: string | null;
  total: number;
};

type OrderItemSummary = {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

function shell(title: string, body: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:${INK};padding:18px 24px">
        <span style="color:#ffffff;font-size:19px;font-weight:700">Elite<span style="color:${BRAND_LIGHT}">MedSource</span></span>
      </div>
      <div style="padding:26px 24px;color:${INK}">
        <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
        ${body}
      </div>
      <div style="padding:14px 24px;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;font-family:Arial,sans-serif">
        ${SITE.name} · ${SITE.tagline.replace("&", "&amp;")}
      </div>
    </div>
  </div>`;
}

function itemsTable(items: OrderItemSummary[], order: OrderSummary): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-family:Arial,sans-serif;font-size:13px">${i.product_name}</td>
        <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-family:Arial,sans-serif;font-size:13px;text-align:center">${i.quantity}</td>
        <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-family:Arial,sans-serif;font-size:13px;text-align:right">${formatPrice(Number(i.total_price))}</td>
      </tr>`
    )
    .join("");

  const shipping = Number(order.shipping_amount ?? 0);
  const discount = Number(order.discount_amount ?? 0);
  const discountRow =
    discount > 0
      ? `<tr><td colspan="2" style="padding:2px 0;font-family:Arial,sans-serif;font-size:13px;color:#475569">Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}</td>
          <td style="padding:2px 0;font-family:Arial,sans-serif;font-size:13px;text-align:right">−${formatPrice(discount)}</td></tr>`
      : "";
  return `
  <table style="width:100%;border-collapse:collapse;margin:14px 0">
    <tr>
      <th style="text-align:left;font-family:Arial,sans-serif;font-size:11px;color:#64748b;padding-bottom:6px">ITEM</th>
      <th style="text-align:center;font-family:Arial,sans-serif;font-size:11px;color:#64748b;padding-bottom:6px">QTY</th>
      <th style="text-align:right;font-family:Arial,sans-serif;font-size:11px;color:#64748b;padding-bottom:6px">TOTAL</th>
    </tr>
    ${rows}
    <tr><td colspan="2" style="padding:8px 0 2px;font-family:Arial,sans-serif;font-size:13px;color:#475569">Subtotal</td>
        <td style="padding:8px 0 2px;font-family:Arial,sans-serif;font-size:13px;text-align:right">${formatPrice(Number(order.subtotal))}</td></tr>
    ${discountRow}
    <tr><td colspan="2" style="padding:2px 0;font-family:Arial,sans-serif;font-size:13px;color:#475569">Shipping</td>
        <td style="padding:2px 0;font-family:Arial,sans-serif;font-size:13px;text-align:right">${shipping === 0 ? "Free" : formatPrice(shipping)}</td></tr>
    <tr><td colspan="2" style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold">Total</td>
        <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-align:right">${formatPrice(Number(order.total))}</td></tr>
  </table>`;
}

const P = `style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#475569;margin:0 0 12px"`;
const REF = (order: OrderSummary) =>
  `<p style="font-family:monospace;font-size:16px;color:${BRAND};margin:0 0 14px">${order.reference_number}</p>`;

export async function sendOrderReceivedEmail(order: OrderSummary, items: OrderItemSummary[]) {
  if (!order.customer_email) return;
  await sendTransactionalEmail({
    to: order.customer_email,
    subject: `Order received — ${order.reference_number}`,
    html: shell(
      "Thank you for your order",
      `${REF(order)}
       <p ${P}>We've received your order and our team will review it shortly. No card is charged online —
       payment is processed on your card on file once the order is approved.</p>
       ${itemsTable(items, order)}
       <p ${P}><a href="${SITE_URL}/account/orders/${order.id}" style="color:${BRAND}">View your order</a></p>`
    ),
  });
}

export async function sendAdminNewOrderEmail(order: OrderSummary, items: OrderItemSummary[]) {
  const to = adminRecipients();
  if (to.length === 0) return;
  await sendTransactionalEmail({
    to,
    subject: `New order ${order.reference_number} — ${formatPrice(Number(order.total))}`,
    html: shell(
      "New order placed",
      `${REF(order)}
       <p ${P}>${order.customer_name ?? "Customer"} (${order.customer_email ?? "no email"}) placed an order.</p>
       ${itemsTable(items, order)}`
    ),
  });
}

const STATUS_COPY: Record<string, { subject: string; body: string } | null> = {
  pending: null,
  confirmed: {
    subject: "Your order is confirmed",
    body: "Your order has been approved. Payment is being processed on your card on file, and we're preparing your items for cold-chain dispatch.",
  },
  shipped: {
    subject: "Your order has shipped",
    body: "Your order is on its way — packed cold-chain and fully tracked. Reply to this email if you need the tracking details.",
  },
  cancelled: {
    subject: "Your order was cancelled",
    body: "Your order has been cancelled. No payment was taken. Reply to this email if you believe this was in error.",
  },
};

export async function sendOrderStatusEmail(order: OrderSummary, status: string) {
  if (!order.customer_email) return;
  const copy = STATUS_COPY[status];
  if (!copy) return;
  await sendTransactionalEmail({
    to: order.customer_email,
    subject: `${copy.subject} — ${order.reference_number}`,
    html: shell(
      copy.subject,
      `${REF(order)}
       <p ${P}>${copy.body}</p>
       <p ${P}><a href="${SITE_URL}/account/orders/${order.id}" style="color:${BRAND}">View your order</a></p>`
    ),
  });
}

export async function sendPaymentUpdateRequestEmail(order: OrderSummary) {
  if (!order.customer_email) return { ok: false };
  return sendTransactionalEmail({
    to: order.customer_email,
    subject: `Action needed on your order — ${order.reference_number}`,
    html: shell(
      "We need updated payment details",
      `${REF(order)}
       <p ${P}>We couldn't process payment on the card we have on file for this order.
       Please submit updated card details so we can continue processing it.</p>
       <p ${P}><a href="${SITE_URL}/account/orders/${order.id}/update-payment"
         style="display:inline-block;background:${BRAND};color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none">
         Update payment details</a></p>`
    ),
  });
}

export async function sendAdminPaymentUpdatedEmail(order: OrderSummary) {
  const to = adminRecipients();
  if (to.length === 0) return;
  await sendTransactionalEmail({
    to,
    subject: `Payment updated on ${order.reference_number}`,
    html: shell(
      "Customer updated their card",
      `${REF(order)}
       <p ${P}>${order.customer_name ?? "The customer"} submitted new card details for this order.
       It's ready for payment processing again.</p>`
    ),
  });
}
