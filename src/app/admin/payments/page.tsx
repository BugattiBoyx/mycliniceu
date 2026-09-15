import Link from "next/link";
import { getActiveStore } from "@/lib/active-store";
import {
  demoPaymentsAllowed,
  ensurePaymentMethods,
  parseConfig,
} from "@/lib/payments";
import { requireUser } from "@/lib/session";
import { BankTransferForm } from "./BankTransferForm";
import { CryptoSettingsForm } from "./CryptoSettingsForm";
import { HighRiskProcessorForm } from "./HighRiskProcessorForm";
import { PaymentMethodsList } from "./PaymentMethodsList";
import { TestPaymentMode } from "./TestPaymentMode";

type Tab = "methods" | "high_risk" | "crypto" | "bank";

function parseTab(value?: string): Tab {
  if (value === "high_risk" || value === "crypto" || value === "bank") return value;
  return "methods";
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) return <p className="text-[#8b8b8b]">No store selected</p>;

  const { tab: tabParam } = await searchParams;
  const tab = parseTab(tabParam);
  const methods = await ensurePaymentMethods(store.id);
  const bank = methods.find((m) => m.type === "bank_transfer");
  const highRisk = methods.find((m) => m.type === "high_risk");
  const crypto = methods.find((m) => m.type === "crypto");
  const demo = methods.find((m) => m.type === "demo");
  const liveEnabled = methods.filter(
    (m) => m.enabled && m.type !== "demo",
  ).length;
  const testLocked = !demoPaymentsAllowed();

  const tabs: { key: Tab; label: string; href: string }[] = [
    { key: "methods", label: "Payment methods", href: "/admin/payments" },
    {
      key: "high_risk",
      label: "High-risk processor",
      href: "/admin/payments?tab=high_risk",
    },
    { key: "crypto", label: "Crypto", href: "/admin/payments?tab=crypto" },
    { key: "bank", label: "Bank transfer", href: "/admin/payments?tab=bank" },
  ];

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            Payments
          </h1>
          <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
            High-risk processors, crypto, and bank transfer · {liveEnabled}{" "}
            live method{liveEnabled === 1 ? "" : "s"} enabled
            {demo?.enabled ? " · test mode ON" : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5 border-b border-[#1f1f1f] pb-3">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
              tab === t.key
                ? "bg-[#3b82f6] text-white"
                : "bg-[#141414] text-[#9a9a9a] hover:bg-[#1c1c1c] hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {tab === "methods" && (
          <>
            {demo && (
              <TestPaymentMode
                storeId={store.id}
                methodId={demo.id}
                enabled={demo.enabled}
                isDefault={demo.isDefault}
                locked={testLocked}
              />
            )}
            <PaymentMethodsList
              storeId={store.id}
              methods={methods.map((m) => ({
                id: m.id,
                type: m.type,
                name: m.name,
                enabled: m.enabled,
                isDefault: m.isDefault,
              }))}
            />
            <p className="mt-4 text-[12.5px] text-[#6a6a6a]">
              Enable Test payment mode to verify the full order flow after
              deploy. Before going live with real customers, disable test mode
              and configure a real processor in the tabs above.
            </p>
          </>
        )}

        {tab === "high_risk" && highRisk && (
          <HighRiskProcessorForm
            storeId={store.id}
            methodId={highRisk.id}
            enabled={highRisk.enabled}
            config={parseConfig(highRisk.config)}
          />
        )}

        {tab === "crypto" && crypto && (
          <CryptoSettingsForm
            storeId={store.id}
            methodId={crypto.id}
            enabled={crypto.enabled}
            config={parseConfig(crypto.config)}
          />
        )}

        {tab === "bank" && bank && (
          <BankTransferForm
            storeId={store.id}
            methodId={bank.id}
            enabled={bank.enabled}
            config={parseConfig(bank.config)}
          />
        )}
      </div>
    </div>
  );
}
