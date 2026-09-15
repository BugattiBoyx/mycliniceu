import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DiscountForm } from "./DiscountForm";

export default async function DiscountsPage() {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) return <p className="text-[#8b8b8b]">No store selected</p>;

  const discounts = await prisma.discount.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1080px]">
      <h1 className="text-[28px] font-semibold tracking-tight">Discounts</h1>
      <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
        Simple percent or fixed codes
      </p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="admin-card p-5">
          <DiscountForm storeId={store.id} />
        </div>
        <div className="admin-card divide-y divide-[#1f1f1f]">
          {discounts.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between px-5 py-3.5 text-[13px]"
            >
              <div>
                <p className="font-mono font-medium">{d.code}</p>
                <p className="mt-0.5 text-[#6a6a6a]">
                  {d.type === "percent" ? `${d.value}%` : `€${d.value}`} ·{" "}
                  {d.active ? "active" : "off"}
                </p>
              </div>
            </div>
          ))}
          {discounts.length === 0 && (
            <p className="px-5 py-10 text-center text-[#6a6a6a]">No discounts</p>
          )}
        </div>
      </div>
    </div>
  );
}
