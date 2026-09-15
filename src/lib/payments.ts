import { prisma } from "./db";

export type PaymentMethodType =
  | "high_risk"
  | "crypto"
  | "bank_transfer"
  | "demo";

const LEGACY_TYPES = ["stripe", "ideal", "paypal"] as const;

export const PAYMENT_METHOD_DEFS: {
  type: PaymentMethodType;
  name: string;
  description: string;
  sortOrder: number;
  defaultEnabled: boolean;
  defaultConfig?: Record<string, string>;
}[] = [
  {
    type: "high_risk",
    name: "High-risk processor",
    description:
      "Connect a high-risk card / MID processor (redirect or hosted checkout).",
    sortOrder: 0,
    defaultEnabled: false,
    defaultConfig: {
      providerName: "",
      apiBaseUrl: "",
      merchantId: "",
      apiKey: "",
      webhookSecret: "",
      checkoutUrl: "",
      instructions:
        "You will be redirected to our payment partner to complete your purchase securely.",
    },
  },
  {
    type: "crypto",
    name: "Crypto payments",
    description: "Accept BTC, ETH, USDT and other crypto settlements.",
    sortOrder: 1,
    defaultEnabled: false,
    defaultConfig: {
      btcAddress: "",
      ethAddress: "",
      usdtAddress: "",
      networkNotes: "Send only on the network shown. Wrong network = lost funds.",
      instructions:
        "Send the exact order total in crypto and include the order number in the memo if supported.",
    },
  },
  {
    type: "bank_transfer",
    name: "Bank transfer",
    description: "Manual IBAN / wire transfer with order reference.",
    sortOrder: 2,
    defaultEnabled: false,
    defaultConfig: {
      accountName: "",
      iban: "",
      bic: "",
      instructions:
        "Transfer the order total and include the order number as reference.",
    },
  },
  {
    type: "demo",
    name: "Test payment mode",
    description:
      "Marks orders paid instantly with no charge — for end-to-end transaction testing after deploy.",
    sortOrder: 3,
    defaultEnabled: false,
  },
];

/**
 * Hard kill-switch for client handoff.
 * - unset / "true": merchant can enable Test payment mode in Admin → Payments
 * - "false": test mode cannot be enabled (checkout rejects it even if toggled)
 */
export function demoPaymentsAllowed() {
  return process.env.ALLOW_DEMO_PAYMENTS !== "false";
}

export async function ensurePaymentMethods(storeId: string) {
  // Remove legacy low-risk processors from this platform
  await prisma.paymentMethod.deleteMany({
    where: { storeId, type: { in: [...LEGACY_TYPES] } },
  });

  const existing = await prisma.paymentMethod.findMany({ where: { storeId } });
  const have = new Set(existing.map((m) => m.type));

  for (const def of PAYMENT_METHOD_DEFS) {
    if (have.has(def.type)) continue;
    await prisma.paymentMethod.create({
      data: {
        storeId,
        type: def.type,
        name: def.name,
        enabled: def.defaultEnabled,
        isDefault: false,
        sortOrder: def.sortOrder,
        config: def.defaultConfig ? JSON.stringify(def.defaultConfig) : null,
      },
    });
  }

  // Keep the display name in sync if an older "Demo payments" row exists.
  await prisma.paymentMethod.updateMany({
    where: { storeId, type: "demo", name: "Demo payments" },
    data: { name: "Test payment mode" },
  });

  // Infrastructure kill-switch: force off when ALLOW_DEMO_PAYMENTS=false.
  if (!demoPaymentsAllowed()) {
    await prisma.paymentMethod.updateMany({
      where: { storeId, type: "demo", enabled: true },
      data: { enabled: false, isDefault: false },
    });
  }

  return prisma.paymentMethod.findMany({
    where: {
      storeId,
      type: { in: PAYMENT_METHOD_DEFS.map((d) => d.type) },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export function parseConfig(config: string | null): Record<string, string> {
  if (!config) return {};
  try {
    return JSON.parse(config) as Record<string, string>;
  } catch {
    return {};
  }
}
