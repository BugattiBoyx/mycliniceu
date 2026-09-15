"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TestPaymentMode({
  storeId,
  methodId,
  enabled,
  isDefault,
  locked,
}: {
  storeId: string;
  methodId: string;
  enabled: boolean;
  isDefault: boolean;
  /** True when ALLOW_DEMO_PAYMENTS=false — toggle is disabled. */
  locked: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function setEnabled(next: boolean) {
    if (locked || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        methodId,
        enabled: next,
        // When turning on for testing, make it the default so checkout picks it up
        ...(next ? { isDefault: true } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not update test payment mode");
      return;
    }
    router.refresh();
  }

  return (
    <div
      className={`admin-card mb-5 overflow-hidden border ${
        enabled
          ? "border-[#f59e0b]/40 bg-[#1a1408]"
          : "border-[#262626] bg-[#141414]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
        <div className="min-w-0 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-medium text-white">
              Test payment mode
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                enabled
                  ? "bg-[#f59e0b]/20 text-[#fbbf24]"
                  : "bg-[#222] text-[#777]"
              }`}
            >
              {enabled ? "ON — no real charges" : "OFF"}
            </span>
            {enabled && isDefault && (
              <span className="rounded-full bg-[#3b82f6]/15 px-2 py-0.5 text-[11px] font-medium text-[#93c5fd]">
                Default checkout method
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#8b8b8b]">
            Run the full order flow after deploy without a payment gateway.
            Orders are marked <span className="text-[#d4d4d4]">paid</span>{" "}
            instantly and appear in Orders / Shipments. Turn this off before
            taking real customer payments.
          </p>
          {locked && (
            <p className="mt-2 text-[12px] text-[#f87171]">
              Locked by infrastructure ({`ALLOW_DEMO_PAYMENTS=false`}). Remove
              that env var to allow testing.
            </p>
          )}
          {error && <p className="mt-2 text-[12px] text-[#f87171]">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {enabled ? (
            <button
              type="button"
              disabled={busy || locked}
              onClick={() => setEnabled(false)}
              className="admin-btn admin-btn-soft disabled:opacity-50"
            >
              {busy ? "Updating…" : "Disable test mode"}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || locked}
              onClick={() => setEnabled(true)}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              {busy ? "Updating…" : "Enable test mode"}
            </button>
          )}
        </div>
      </div>

      {enabled && (
        <div className="border-t border-[#f59e0b]/20 bg-[#0f0c06] px-5 py-3 text-[12px] text-[#a89f94]">
          Storefront checkout will show{" "}
          <span className="text-[#fbbf24]">Test betaling</span>. Place a test
          order → confirm it lands in Admin → Orders as paid.
        </div>
      )}
    </div>
  );
}
