"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function BankTransferForm({
  storeId,
  methodId,
  enabled,
  config,
}: {
  storeId: string;
  methodId: string;
  enabled: boolean;
  config: {
    accountName?: string;
    iban?: string;
    bic?: string;
    instructions?: string;
  };
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
          accountName: String(fd.get("accountName") || ""),
          iban: String(fd.get("iban") || ""),
          bic: String(fd.get("bic") || ""),
          instructions: String(fd.get("instructions") || ""),
        },
      }),
    });
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-4 p-5">
      <label className="flex items-center gap-2 text-[13px] text-[#cfcfcf]">
        <input
          type="checkbox"
          name="enable"
          defaultChecked={enabled}
          className="h-4 w-4 rounded border-[#333] bg-black"
        />
        Enable bank transfer
      </label>
      <label className="block">
        <span className="admin-label">Account name</span>
        <input
          name="accountName"
          defaultValue={config.accountName || ""}
          className="admin-input"
        />
      </label>
      <label className="block">
        <span className="admin-label">IBAN</span>
        <input
          name="iban"
          defaultValue={config.iban || ""}
          placeholder="NL00 BANK 0123 4567 89"
          className="admin-input font-mono"
        />
      </label>
      <label className="block">
        <span className="admin-label">BIC / SWIFT</span>
        <input name="bic" defaultValue={config.bic || ""} className="admin-input font-mono" />
      </label>
      <label className="block">
        <span className="admin-label">Instructions</span>
        <textarea
          name="instructions"
          rows={3}
          defaultValue={
            config.instructions ||
            "Transfer the order total and include the order number as payment reference."
          }
          className="admin-textarea"
        />
      </label>
      {saved && <p className="text-[13px] text-[#93c5fd]">Saved</p>}
      <button type="submit" className="admin-btn admin-btn-primary px-5 py-2.5">
        Save bank transfer
      </button>
    </form>
  );
}
