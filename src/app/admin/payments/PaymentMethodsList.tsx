"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Method = {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
};

const DESCRIPTIONS: Record<string, string> = {
  high_risk:
    "High-risk card / MID processor — configure provider URL and keys.",
  crypto: "BTC, ETH, USDT and other crypto settlement wallets.",
  bank_transfer: "Manual IBAN / wire transfer with order reference.",
};

export function PaymentMethodsList({
  storeId,
  methods,
}: {
  storeId: string;
  methods: Method[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  // Test mode has its own card — keep this list for real processors only.
  const liveMethods = methods.filter((m) => m.type !== "demo");

  async function patch(methodId: string, body: Record<string, unknown>) {
    setBusy(methodId);
    await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, methodId, ...body }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="admin-card divide-y divide-[#1f1f1f]">
      {liveMethods.map((m) => (
        <div
          key={m.id}
          className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-medium text-white">{m.name}</p>
              {m.isDefault && (
                <span className="rounded-full bg-[#3b82f6]/15 px-2 py-0.5 text-[11px] font-medium text-[#93c5fd]">
                  Default
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  m.enabled
                    ? "bg-[#14532d]/40 text-[#4ade80]"
                    : "bg-[#222] text-[#777]"
                }`}
              >
                {m.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-[#8b8b8b]">
              {DESCRIPTIONS[m.type] || m.type}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!m.isDefault && m.enabled && (
              <button
                type="button"
                disabled={busy === m.id}
                onClick={() => patch(m.id, { isDefault: true })}
                className="admin-btn admin-btn-soft disabled:opacity-50"
              >
                Set default
              </button>
            )}
            <button
              type="button"
              disabled={busy === m.id}
              onClick={() => patch(m.id, { enabled: !m.enabled })}
              className={`admin-btn disabled:opacity-50 ${
                m.enabled ? "admin-btn-soft" : "admin-btn-primary"
              }`}
            >
              {m.enabled ? "Disable" : "Enable"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
