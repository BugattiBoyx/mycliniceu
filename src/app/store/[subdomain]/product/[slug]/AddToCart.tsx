"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatEuro } from "@/lib/format";

export function AddToCart({
  storeId,
  basePath,
  brandColor,
  variants,
}: {
  storeId: string;
  basePath: string;
  brandColor: string;
  variants: { id: string; label: string; price: number }[];
}) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const selected = variants.find((v) => v.id === variantId) || variants[0];

  async function add() {
    if (!variantId) return;
    setLoading(true);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, variantId, quantity: 1 }),
    });
    setLoading(false);
    router.push(`${basePath}/cart`);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-2xl font-semibold" style={{ color: brandColor }}>
        {selected ? formatEuro(selected.price) : "—"}
      </p>
      <label className="block text-sm font-medium">
        Dosage
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} — {formatEuro(v.price)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={add}
        disabled={loading || !variantId}
        className="rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: brandColor }}
      >
        {loading ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
