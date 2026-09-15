"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function DiscountForm({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        code: fd.get("code"),
        type: fd.get("type"),
        value: Number(fd.get("value")),
      }),
    });
    if (!res.ok) {
      setError((await res.json()).error || "Failed");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="admin-label">Code</span>
        <input name="code" required className="admin-input uppercase" />
      </label>
      <label className="block">
        <span className="admin-label">Type</span>
        <select name="type" className="admin-select">
          <option value="percent">Percent</option>
          <option value="fixed">Fixed (€)</option>
        </select>
      </label>
      <label className="block">
        <span className="admin-label">Value</span>
        <input name="value" type="number" step="0.01" required className="admin-input" />
      </label>
      {error && <p className="text-[13px] text-red-400">{error}</p>}
      <button type="submit" className="admin-btn admin-btn-primary">
        Create discount
      </button>
    </form>
  );
}
