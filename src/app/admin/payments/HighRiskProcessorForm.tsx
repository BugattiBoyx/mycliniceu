"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HighRiskProcessorForm({
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
          providerName: String(fd.get("providerName") || ""),
          apiBaseUrl: String(fd.get("apiBaseUrl") || ""),
          merchantId: String(fd.get("merchantId") || ""),
          apiKey: String(fd.get("apiKey") || ""),
          webhookSecret: String(fd.get("webhookSecret") || ""),
          checkoutUrl: String(fd.get("checkoutUrl") || ""),
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
        Built for high-risk MIDs and specialty processors. Paste your provider
        credentials and hosted checkout URL. Webhooks can post to{" "}
        <code className="text-[#9a9a9a]">/api/webhooks/payments</code>.
      </p>
      <label className="flex items-center gap-2 text-[13px] text-[#cfcfcf]">
        <input
          type="checkbox"
          name="enable"
          defaultChecked={enabled}
          className="h-4 w-4 rounded border-[#333] bg-black"
        />
        Enable high-risk processor
      </label>
      {(
        [
          ["providerName", "Provider name", "e.g. NMI, Authorize.net high-risk, custom PSP"],
          ["apiBaseUrl", "API base URL", "https://api.processor.com"],
          ["merchantId", "Merchant / MID ID", ""],
          ["apiKey", "API key / secret", ""],
          ["webhookSecret", "Webhook secret", ""],
          ["checkoutUrl", "Hosted checkout URL", "https://pay.processor.com/checkout"],
        ] as const
      ).map(([name, label, placeholder]) => (
        <label key={name} className="block">
          <span className="admin-label">{label}</span>
          <input
            name={name}
            defaultValue={config[name] || ""}
            placeholder={placeholder}
            className="admin-input font-mono text-[13px]"
          />
        </label>
      ))}
      <label className="block">
        <span className="admin-label">Customer instructions</span>
        <textarea
          name="instructions"
          rows={3}
          defaultValue={
            config.instructions ||
            "You will be redirected to our payment partner to complete your purchase securely."
          }
          className="admin-textarea"
        />
      </label>
      {saved && <p className="text-[13px] text-[#93c5fd]">Saved</p>}
      <button type="submit" className="admin-btn admin-btn-primary px-5 py-2.5">
        Save processor settings
      </button>
    </form>
  );
}
