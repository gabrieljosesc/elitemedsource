/**
 * Site-wide identity and contact details.
 *
 * Contact details can be overridden from the environment so they can be
 * filled in (or changed) without a code change:
 *   NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_CONTACT_PHONE, NEXT_PUBLIC_CONTACT_FAX
 *
 * Phone / fax are optional — components hide them while they're empty.
 */
export const SITE = {
  name: "Elite MedSource",
  tagline: "Rheumatology & specialty medical supply",
  description:
    "Wholesale rheumatology biologics and specialty medical supply for licensed professionals — plus orthopedic injectables, dermal fillers, botulinum toxins, and peptides, sourced authentic and shipped cold-chain nationwide.",
  domain: "elitemedsource.com",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://elitemedsource.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@elitemedsource.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
  fax: process.env.NEXT_PUBLIC_CONTACT_FAX || "",
  /** Shown in the announcement bar and trust strip. */
  shippingPromise: "Your first order ships free — then free on orders $800+",
} as const;

/** `tel:` href for a human-formatted phone number. */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}
