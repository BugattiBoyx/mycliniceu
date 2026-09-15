"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StoreActions({
  storeId,
  status,
  menu = false,
}: {
  storeId: string;
  status: string;
  menu?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: string) {
    setBusy(true);
    await fetch("/api/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, action }),
    });
    setBusy(false);
    router.refresh();
  }

  if (menu) {
    const item =
      "block w-full px-3 py-2 text-left text-[13px] text-[#d4d4d4] hover:bg-[#1f1f1f] disabled:opacity-50";
    return (
      <div className="flex flex-col">
        <button type="button" disabled={busy} className={item} onClick={() => act(status === "live" ? "unpublish" : "publish")}>
          {status === "live" ? "Unpublish" : "Publish"}
        </button>
        <button type="button" disabled={busy} className={item} onClick={() => act("duplicate")}>
          Duplicate
        </button>
        <a href="/admin/storefronts/theme" className={item}>
          Change template
        </a>
        <button
          type="button"
          disabled={busy}
          className={`${item} text-red-400`}
          onClick={() => {
            if (confirm("Delete this storefront?")) act("delete");
          }}
        >
          Delete storefront
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => act(status === "live" ? "unpublish" : "publish")}
        className="admin-btn admin-btn-soft disabled:opacity-50"
      >
        {status === "live" ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => act("duplicate")}
        className="admin-btn admin-btn-soft disabled:opacity-50"
      >
        Duplicate
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (confirm("Delete this storefront?")) act("delete");
        }}
        className="admin-btn admin-btn-soft text-red-400 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
