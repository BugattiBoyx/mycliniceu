import Link from "next/link";
import { Suspense } from "react";
import { OrdersPagination } from "@/components/admin/OrdersPagination";
import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { parseOrderMeta } from "@/lib/order-meta";
import { requireUser } from "@/lib/session";
import { ensureShipmentsForStore } from "@/lib/shipments";
import { ShipmentCard } from "./ShipmentCard";
import { ShipmentsSearch } from "./ShipmentsSearch";

type View = "all" | "unfulfilled" | "shipped";

const PAGE_SIZES = [50, 100, 200] as const;

function parseView(value?: string): View {
  if (value === "unfulfilled" || value === "shipped") return value;
  return "all";
}

function parsePerPage(value?: string) {
  const n = Number(value);
  if (PAGE_SIZES.includes(n as (typeof PAGE_SIZES)[number])) return n;
  return 50;
}

function parsePage(value?: string) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    page?: string;
    perPage?: string;
  }>;
}) {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) {
    return <p className="text-[#8b8b8b]">No store selected</p>;
  }

  await ensureShipmentsForStore(store.id);

  const params = await searchParams;
  const view = parseView(params.view);
  const q = String(params.q || "").trim();
  const perPage = parsePerPage(params.perPage);
  let page = parsePage(params.page);

  const statusFilter =
    view === "all"
      ? undefined
      : view === "shipped"
        ? { status: { in: ["shipped", "delivered"] } }
        : { status: { in: ["unfulfilled", "preparing"] } };

  const searchFilter = q
    ? {
        OR: [
          { trackingNumber: { contains: q } },
          { carrier: { contains: q } },
          {
            order: {
              OR: [
                { number: { contains: q } },
                { email: { contains: q } },
                { customerName: { contains: q } },
              ],
            },
          },
        ],
      }
    : {};

  const where = {
    storeId: store.id,
    ...statusFilter,
    ...searchFilter,
  };

  const filteredTotal = await prisma.shipment.count({ where });
  const totalPages = Math.max(1, Math.ceil(filteredTotal / perPage));
  if (page > totalPages) page = totalPages;

  const shipments = await prisma.shipment.findMany({
    where,
    include: {
      order: { include: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  const counts = await prisma.shipment.groupBy({
    by: ["status"],
    where: { storeId: store.id },
    _count: true,
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count]),
  ) as Record<string, number>;
  const allTotal = Object.values(countMap).reduce((s, n) => s + n, 0);
  const unfulfilledCount =
    (countMap.unfulfilled || 0) + (countMap.preparing || 0);

  const tabs: { view: View; label: string; count: number }[] = [
    { view: "all", label: "All", count: allTotal },
    { view: "unfulfilled", label: "Unfulfilled", count: unfulfilledCount },
    {
      view: "shipped",
      label: "Shipped",
      count: (countMap.shipped || 0) + (countMap.delivered || 0),
    },
  ];

  function tabHref(tabView: View) {
    const sp = new URLSearchParams();
    if (tabView !== "all") sp.set("view", tabView);
    if (q) sp.set("q", q);
    if (perPage !== 50) sp.set("perPage", String(perPage));
    const qs = sp.toString();
    return qs ? `/admin/shipments?${qs}` : "/admin/shipments";
  }

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            Shipments
          </h1>
          <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
            Manage fulfillment, carriers, and tracking for paid orders
          </p>
        </div>
        <Suspense
          fallback={
            <div className="admin-input h-[38px] w-full max-w-md opacity-50" />
          }
        >
          <ShipmentsSearch initialQuery={q} />
        </Suspense>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = view === tab.view;
          return (
            <Link
              key={tab.view}
              href={tabHref(tab.view)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] ${
                active
                  ? "bg-[#222] text-white"
                  : "text-[#8b8b8b] hover:text-white"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[#6a6a6a]">{tab.count}</span>
            </Link>
          );
        })}
      </div>

      {q && (
        <p className="mt-4 text-[13px] text-[#8b8b8b]">
          {filteredTotal} result{filteredTotal === 1 ? "" : "s"} for “{q}”
          <Link
            href={
              view === "all"
                ? "/admin/shipments"
                : `/admin/shipments?view=${view}`
            }
            className="ml-2 text-[#5b8def] hover:underline"
          >
            Clear
          </Link>
        </p>
      )}

      {filteredTotal === 0 ? (
        <section className="admin-card admin-empty mt-8">
          <h2 className="text-[18px] font-medium text-white">
            {q ? "No matching shipments" : "No shipments"}
          </h2>
          <p className="mt-3 max-w-lg text-[14px] text-[#8b8b8b]">
            {q
              ? "Try another order number, customer name, email, or tracking code."
              : "Shipments appear when orders are placed. Ship them and add tracking numbers here."}
          </p>
        </section>
      ) : (
        <div className="admin-card mt-6 overflow-hidden">
          <div className="divide-y divide-[#1f1f1f]">
            {shipments.map((s) => {
              const meta = parseOrderMeta(s.order.shippingAddress);
              const cityLine = [meta.zip, meta.city].filter(Boolean).join(" ");
              const addressLine = [meta.address, cityLine, meta.country]
                .filter(Boolean)
                .join(", ");
              const itemCount = s.order.items.reduce(
                (n, i) => n + i.quantity,
                0,
              );
              return (
                <ShipmentCard
                  key={s.id}
                  shipmentId={s.id}
                  orderId={s.order.id}
                  orderNumber={s.order.number}
                  customerLabel={s.order.customerName || s.order.email}
                  total={s.order.total}
                  itemCount={itemCount}
                  addressLine={addressLine || null}
                  initialStatus={s.status}
                  initialCarrier={s.carrier}
                  initialTrackingNumber={s.trackingNumber}
                  initialTrackingUrl={s.trackingUrl}
                  initialNotes={s.notes}
                  initialShippedAt={s.shippedAt?.toISOString() ?? null}
                />
              );
            })}
          </div>
          <Suspense fallback={null}>
            <OrdersPagination
              page={page}
              perPage={perPage}
              total={filteredTotal}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
