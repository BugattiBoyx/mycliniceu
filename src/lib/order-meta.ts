export type OrderShippingMeta = {
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  paymentMethod?: string;
  // payment instructions / details (success page)
  accountName?: string;
  iban?: string;
  bic?: string;
  btcAddress?: string;
  ethAddress?: string;
  usdtAddress?: string;
  networkNotes?: string;
  instructions?: string;
  providerName?: string;
  [key: string]: string | undefined;
};

const PAYMENT_LABELS: Record<string, string> = {
  demo: "Test payment",
  high_risk: "High-risk processor",
  crypto: "Crypto",
  bank_transfer: "Bank transfer",
  bank: "Bank transfer",
};

export function parseOrderMeta(raw: string | null | undefined): OrderShippingMeta {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: OrderShippingMeta = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v == null) continue;
      out[k] = String(v);
    }
    return out;
  } catch {
    // Plain-text address from older data
    return { address: raw };
  }
}

export function paymentMethodLabel(type?: string) {
  if (!type) return "—";
  return PAYMENT_LABELS[type] || type;
}

export function hasShippingInfo(meta: OrderShippingMeta) {
  return Boolean(
    meta.address || meta.city || meta.zip || meta.country || meta.phone,
  );
}
