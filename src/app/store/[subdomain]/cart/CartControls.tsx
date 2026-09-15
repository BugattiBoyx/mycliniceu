"use client";

import { useRouter } from "next/navigation";

export function CartControls({
  storeId,
  itemId,
  quantity,
}: {
  storeId: string;
  itemId: string;
  quantity: number;
}) {
  const router = useRouter();

  async function setQty(next: number) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, itemId, quantity: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setQty(quantity - 1)}
        className="h-8 w-8 rounded-lg border border-black/10"
      >
        −
      </button>
      <span className="w-6 text-center text-sm">{quantity}</span>
      <button
        type="button"
        onClick={() => setQty(quantity + 1)}
        className="h-8 w-8 rounded-lg border border-black/10"
      >
        +
      </button>
    </div>
  );
}
