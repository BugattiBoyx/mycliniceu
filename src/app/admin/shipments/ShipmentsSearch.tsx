"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function ShipmentsSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/admin/shipments?${qs}` : "/admin/shipments");
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-md">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search order #, customer, email, tracking…"
        className="admin-input w-full pl-3 pr-20"
        aria-label="Search shipments"
      />
      <button
        type="submit"
        className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md bg-[#222] px-2.5 py-1 text-[12px] text-white hover:bg-[#2a2a2a]"
      >
        Search
      </button>
    </form>
  );
}
