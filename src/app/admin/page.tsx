import Link from "next/link";
import { Suspense } from "react";
import { HomePeriodSelector } from "@/components/admin/HomePeriodSelector";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { getActiveStore } from "@/lib/active-store";
import {
  EST_MARGIN,
  buildTimeline,
  getRangeBounds,
  parseRangeKey,
  pctChange,
  RANGE_OPTIONS,
  type RangeKey,
} from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/format";
import { requireUser } from "@/lib/session";

function Delta({ value }: { value: number }) {
  if (!Number.isFinite(value)) return null;
  const up = value >= 0;
  return (
    <span className={`text-[12px] font-medium ${up ? "text-[#4ade80]" : "text-[#f87171]"}`}>
      {up ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function KpiCard({
  label,
  value,
  hint,
  delta,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] text-[#8b8b8b]">{label}</p>
        {delta != null && <Delta value={delta} />}
      </div>
      <p className="mt-2 text-[26px] font-semibold tracking-tight text-white">
        {value}
      </p>
      {hint && <p className="mt-1 text-[11.5px] text-[#555]">{hint}</p>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="admin-card block p-4 transition hover:bg-[#181818]">
        {inner}
      </Link>
    );
  }
  return <div className="admin-card p-4">{inner}</div>;
}

async function metricsFor(
  storeId: string,
  from: Date,
  to: Date,
) {
  const [orders, newCustomers, openCarts, productCount] = await Promise.all([
    prisma.order.findMany({
      where: { storeId, createdAt: { gte: from, lte: to } },
      include: { items: true },
    }),
    prisma.customer.count({
      where: { storeId, createdAt: { gte: from, lte: to } },
    }),
    prisma.cart.count({
      where: {
        storeId,
        updatedAt: { gte: from, lte: to },
        items: { some: {} },
      },
    }),
    prisma.product.count({ where: { storeId, status: "active" } }),
  ]);

  const paid = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
  const pending = orders.filter((o) => o.status === "pending");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");
  const refunded = orders.filter((o) => o.status === "refunded");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const units = paid.reduce(
    (s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0),
    0,
  );
  const aov = paid.length ? revenue / paid.length : 0;
  const profit = revenue * EST_MARGIN;
  const sessionsProxy = openCarts + paid.length;
  const conversion = sessionsProxy ? (paid.length / sessionsProxy) * 100 : 0;

  return {
    orders,
    revenue,
    profit,
    orderCount: orders.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    shipments: fulfilled.length,
    refundedCount: refunded.length,
    aov,
    units,
    newCustomers,
    openCarts,
    productCount,
    conversion,
  };
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireUser();
  const { store, stores } = await getActiveStore(user.id);
  const params = await searchParams;
  const range = parseRangeKey(params.range);
  const rangeLabel = RANGE_OPTIONS.find((r) => r.key === range)?.label || "Last 30 days";

  if (!store) {
    return (
      <div className="mx-auto max-w-[1120px]">
        <h1 className="text-[28px] font-semibold tracking-tight text-white">Home</h1>
        <section className="admin-card admin-empty mt-8">
          <h2 className="text-[18px] font-medium text-white">
            Create your first storefront
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#8b8b8b]">
            Pick a template and publish on your own subdomain.
          </p>
          <Link
            href="/admin/storefronts/new"
            className="admin-btn admin-btn-primary mt-6 px-4 py-2.5"
          >
            Add storefront
          </Link>
        </section>
      </div>
    );
  }

  const { from, to, previousFrom, previousTo } = getRangeBounds(range);
  const [current, previous, recentOrders] = await Promise.all([
    metricsFor(store.id, from, to),
    range === "all"
      ? Promise.resolve(null)
      : metricsFor(store.id, previousFrom, previousTo),
    prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const timelineFrom =
    range === "all" && current.orders.length
      ? new Date(
          Math.min(...current.orders.map((o) => o.createdAt.getTime())),
        )
      : range === "all"
        ? new Date(to.getTime() - 365 * 86400000)
        : from;
  const timeline = buildTimeline(
    current.orders,
    timelineFrom,
    to,
    range as RangeKey,
  );

  const kpis = [
    {
      label: "Revenue",
      value: formatEuro(current.revenue),
      hint: "Paid + fulfilled orders",
      delta: previous ? pctChange(current.revenue, previous.revenue) : undefined,
      href: "/admin/orders",
    },
    {
      label: "Est. profit",
      value: formatEuro(current.profit),
      hint: `${Math.round(EST_MARGIN * 100)}% gross margin estimate`,
      delta: previous ? pctChange(current.profit, previous.profit) : undefined,
    },
    {
      label: "Orders",
      value: String(current.orderCount),
      hint: `${current.paidCount} paid · ${current.pendingCount} pending`,
      delta: previous ? pctChange(current.orderCount, previous.orderCount) : undefined,
      href: "/admin/orders",
    },
    {
      label: "Avg. order value",
      value: formatEuro(current.aov),
      hint: "Across paid orders",
      delta: previous ? pctChange(current.aov, previous.aov) : undefined,
    },
    {
      label: "Shipments",
      value: String(current.shipments),
      hint: "Fulfilled orders",
      delta: previous ? pctChange(current.shipments, previous.shipments) : undefined,
      href: "/admin/shipments",
    },
    {
      label: "Units sold",
      value: String(current.units),
      hint: "Line items in paid orders",
      delta: previous ? pctChange(current.units, previous.units) : undefined,
    },
    {
      label: "New customers",
      value: String(current.newCustomers),
      hint: "First-time in this period",
      delta: previous
        ? pctChange(current.newCustomers, previous.newCustomers)
        : undefined,
      href: "/admin/customers",
    },
    {
      label: "Conversion",
      value: `${current.conversion.toFixed(1)}%`,
      hint: `${current.openCarts} active carts`,
      delta: previous ? pctChange(current.conversion, previous.conversion) : undefined,
    },
    {
      label: "Refunds",
      value: String(current.refundedCount),
      hint: "Refunded orders",
      delta: previous
        ? pctChange(current.refundedCount, previous.refundedCount)
        : undefined,
    },
    {
      label: "Catalog",
      value: String(current.productCount),
      hint: "Active products",
      href: "/admin/products",
    },
    {
      label: "Pending",
      value: String(current.pendingCount),
      hint: "Awaiting payment",
      href: "/admin/orders",
    },
    {
      label: "Themes",
      value: String(stores.length),
      hint: "Choose or upload theme",
      href: "/admin/storefronts",
    },
  ];

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            Home
          </h1>
          <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
            Welcome back{user.name ? `, ${user.name}` : ""}.{" "}
            <span className="text-[#6a6a6a]">{store.name} · {rangeLabel}</span>
          </p>
        </div>
        <Link href="/admin/storefronts" className="admin-btn admin-btn-primary">
          Themes
        </Link>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div className="h-9" />}>
          <HomePeriodSelector value={range} />
        </Suspense>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="mt-4">
        <RevenueChart buckets={timeline} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] px-5 py-3.5">
            <p className="text-[14px] font-medium">Recent orders</p>
            <Link href="/admin/orders" className="text-[12.5px] text-[#93c5fd]">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-[#6a6a6a]">
              No orders yet — complete a checkout on your storefront to see data.
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#161616]">
                    <td>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium hover:text-[#93c5fd]"
                      >
                        {o.number}
                      </Link>
                    </td>
                    <td className="text-[#a3a3a3]">
                      {o.customerName || o.email}
                    </td>
                    <td>{formatEuro(o.total)}</td>
                    <td className="capitalize text-[#8b8b8b]">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card p-5">
          <p className="text-[14px] font-medium">Period snapshot</p>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b8b8b]">Range</dt>
              <dd className="text-right text-white">{rangeLabel}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b8b8b]">From</dt>
              <dd className="text-right text-white">
                {from.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b8b8b]">To</dt>
              <dd className="text-right text-white">
                {to.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[#1f1f1f] pt-3">
              <dt className="text-[#8b8b8b]">vs previous period</dt>
              <dd className="text-right">
                {previous ? (
                  <Delta value={pctChange(current.revenue, previous.revenue)} />
                ) : (
                  <span className="text-[#6a6a6a]">—</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b8b8b]">Net after refunds</dt>
              <dd className="text-right text-white">
                {formatEuro(
                  current.revenue -
                    current.orders
                      .filter((o) => o.status === "refunded")
                      .reduce((s, o) => s + o.total, 0),
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
