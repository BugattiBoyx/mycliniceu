import type { Metadata } from "next";
import { CheckoutClient, type CheckoutMethod } from "@/components/mj/CheckoutClient";
import { MJ_PHARMACY_NAME } from "@/lib/mj/brand";
import { prisma } from "@/lib/db";
import { ensurePaymentMethods, parseConfig } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Afrekenen",
};

export const dynamic = "force-dynamic";

export default async function AfrekenenPage() {
  let storeId = "";
  let methods: CheckoutMethod[] = [];

  try {
    const store = await prisma.store.findFirst({
      where: { slug: "moun-journey", status: "live" },
    });

    if (store) {
      storeId = store.id;
      const all = await ensurePaymentMethods(store.id);
      methods = all
        .filter((m) => m.enabled)
        .map((m) => {
          const config = parseConfig(m.config);
          // Only pass fields the checkout UI needs — never API keys/secrets
          const safe: Record<string, string> = {};
          for (const key of [
            "accountName",
            "iban",
            "bic",
            "btcAddress",
            "ethAddress",
            "usdtAddress",
            "networkNotes",
            "providerName",
            "instructions",
          ]) {
            if (config[key]) safe[key] = config[key];
          }
          return { type: m.type, config: safe };
        });
    }
  } catch (err) {
    console.warn("Could not query DB for payment methods, using fallback:", err);
    methods = [
      {
        type: "bank_transfer",
        config: {
          accountName: `${MJ_PHARMACY_NAME} BV`,
          iban: "NL91 ABNA 0417 1643 00",
          bic: "ABNANL2A",
          instructions: "Vermeld je bestelnummer bij de overboeking.",
        },
      },
      {
        type: "crypto",
        config: {
          btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          usdtAddress: "0x71C...8942",
          networkNotes: "USDT (TRC-20 / ERC-20) of Bitcoin.",
        },
      },
    ];
  }

  return <CheckoutClient storeId={storeId} methods={methods} />;
}
