"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/analytics";

export function HomePeriodSelector({ value }: { value: RangeKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setRange(next: RangeKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {RANGE_OPTIONS.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => setRange(opt.key)}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
              active
                ? "bg-[#3b82f6] text-white"
                : "bg-[#141414] text-[#9a9a9a] hover:bg-[#1c1c1c] hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
