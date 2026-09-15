/** Storefront branding — override per deploy via NEXT_PUBLIC_* (inlined at build). */

export const MJ_BRAND_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "The Clinic";

export const MJ_BRAND_EMAIL =
  process.env.NEXT_PUBLIC_SITE_EMAIL?.trim() || "info@theclinic.nl";

export const MJ_PHARMACY_NAME =
  process.env.NEXT_PUBLIC_PHARMACY_NAME?.trim() ||
  `${MJ_BRAND_NAME} Pharmacy`;

export const MJ_COMPANY_NAME =
  process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || `${MJ_BRAND_NAME} B.V.`;

export const MJ_COPYRIGHT = `Copyright © ${MJ_BRAND_NAME}. Alle rechten voorbehouden.`;

export function mjWhatsAppMessage() {
  return `Hallo ${MJ_BRAND_NAME}, ik heb een vraag.`;
}
