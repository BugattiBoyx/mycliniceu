import { formatEuro } from "@/lib/format";

export function RevenueChart({
  buckets,
}: {
  buckets: { label: string; revenue: number; orders: number }[];
}) {
  const max = Math.max(...buckets.map((b) => b.revenue), 1);
  const showEvery = buckets.length > 14 ? Math.ceil(buckets.length / 8) : 1;
  const hasAny = buckets.some((b) => b.revenue > 0);

  return (
    <div className="admin-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-[#8b8b8b]">Revenue timeline</p>
          <p className="mt-0.5 text-[14px] font-medium text-white">
            Paid order volume over selected period
          </p>
        </div>
      </div>

      {!hasAny ? (
        <div className="mt-6 flex h-44 items-center justify-center rounded-[8px] border border-dashed border-[#2a2a2a] text-[13px] text-[#6a6a6a]">
          No paid revenue in this period yet
        </div>
      ) : (
        <>
          {/* h-full on each column is required — % bar heights need a definite parent height */}
          <div className="mt-6 flex h-44 items-end gap-1 sm:gap-1.5">
            {buckets.map((b, i) => {
              const h = b.revenue === 0 ? 3 : Math.max(8, (b.revenue / max) * 100);
              return (
                <div
                  key={`${b.label}-${i}`}
                  className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-md bg-[#222] px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
                    {formatEuro(b.revenue)} · {b.orders} orders
                  </div>
                  <div
                    className="w-full rounded-t-[3px] bg-[#3b82f6] transition group-hover:bg-[#60a5fa]"
                    style={{
                      height: `${h}%`,
                      opacity: b.revenue === 0 ? 0.25 : 1,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1 sm:gap-1.5">
            {buckets.map((b, i) => (
              <div
                key={`l-${b.label}-${i}`}
                className="min-w-0 flex-1 text-center text-[10px] text-[#555]"
              >
                {i % showEvery === 0 ? b.label : ""}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
