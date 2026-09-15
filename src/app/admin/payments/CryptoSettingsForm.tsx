"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CryptoSettingsForm({
  storeId,
  methodId,
  enabled,
  config,
}: {
  storeId: string;
  methodId: string;
  enabled: boolean;
  config: Record<string, string>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        methodId,
        enabled: fd.get("enable") === "on",
        config: {
          btcAddress: String(fd.get("btcAddress") || ""),
          ethAddress: String(fd.get("ethAddress") || ""),
          usdtAddress: String(fd.get("usdtAddress") || ""),
          networkNotes: String(fd.get("networkNotes") || ""),
          instructions: String(fd.get("instructions") || ""),
        },
      }),
    });
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-4 p-5">
      <p className="text-[13px] text-[#8b8b8b]">
        Show wallet addresses at checkout confirmation. Orders stay pending until
        you mark them paid after on-chain confirmation.
      </p>
      <label className="flex items-center gap-2 text-[13px] text-[#cfcfcf]">
        <input
          type="checkbox"
          name="enable"
          defaultChecked={enabled}
          className="h-4 w-4 rounded border-[#333] bg-black"
        />
        Enable crypto payments
      </label>
      <label className="block">
        <span className="admin-label">BTC address</span>
        <input
          name="btcAddress"
          defaultValue={config.btcAddress || ""}
          className="admin-input font-mono text-[13px]"
        />
      </label>
      <label className="block">
        <span className="admin-label">ETH address</span>
        <input
          name="ethAddress"
          defaultValue={config.ethAddress || ""}
          className="admin-input font-mono text-[13px]"
        />
      </label>
      <label className="block">
        <span className="admin-label">USDT address</span>
        <input
          name="usdtAddress"
          defaultValue={config.usdtAddress || ""}
          className="admin-input font-mono text-[13px]"
        />
      </label>
      <label className="block">
        <span className="admin-label">Network notes</span>
        <input
          name="networkNotes"
          defaultValue={
            config.networkNotes ||
            "Send only on the network shown. Wrong network = lost funds."
          }
          className="admin-input"
        />
      </label>
      <label className="block">
        <span className="admin-label">Customer instructions</span>
        <textarea
          name="instructions"
          rows={3}
          defaultValue={
            config.instructions ||
            "Send the exact order total in crypto and include the order number in the memo if supported."
          }
          className="admin-textarea"
        />
      </label>
      {saved && <p className="text-[13px] text-[#93c5fd]">Saved</p>}
      <button type="submit" className="admin-btn admin-btn-primary px-5 py-2.5">
        Save crypto settings
      </button>
    </form>
  );
}
