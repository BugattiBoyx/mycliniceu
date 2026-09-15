"use client";

import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-[13px] text-red-400 hover:text-red-300"
      onClick={async () => {
        if (!confirm("Delete product?")) return;
        await fetch("/api/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}
