import Link from "next/link";
import { Suspense } from "react";
import { IconHelp } from "@/components/admin/icons";
import { OrdersPagination } from "@/components/admin/OrdersPagination";
import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/format";
import { requireUser } from "@/lib/session";

type View = "all" | "draft" | "carts";

const PAGE_SIZES = [50, 100, 200] as const;

function parseView(value?: string): View {
  if (value === "draft" || value === "carts") return value;
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string; perPage?: string }>;
}) {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) {
    return <p className="text-[#8b8b8b]">No store selected</p>;
  }

  const params = await searchParams;
  const view = parseView(params.view);
  const perPage = parsePerPage(params.perPage);
  let page = parsePage(params.page);

  const title =
    view === "draft" ? "Draft orders" : view === "carts" ? "Carts" : "Orders";

  if (view === "carts") {
    const carts = await prisma.cart.findMany({
      where: { storeId: store.id, items: { some: {} } },
      include: {
        items: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return (
      <div className="mx-auto max-w-[1080px]">
        <h1 className="text-[28px] font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
          Open carts with items still in checkout
        </p>
        {carts.length === 0 ? (
          <section className="admin-card admin-empty mt-8">
            <h2 className="text-[18px] font-medium text-white">No open carts</h2>
            <p className="mt-3 max-w-lg text-[14px] text-[#8b8b8b]">
              Carts appear here when shoppers add products but haven&apos;t
              completed checkout.
            </p>
          </section>
        ) : (
          <div className="admin-card mt-8 overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cart</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {carts.map((cart) => {
                  const total = cart.items.reduce(
                    (s, i) => s + i.variant.price * i.quantity,
                    0,
                  );
                  const qty = cart.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr key={cart.id} className="hover:bg-[#161616]">
                      <td className="font-mono text-[12px] text-[#a3a3a3]">
                        {cart.token.slice(0, 10)}…
                      </td>
                      <td>{qty}</td>
                      <td>{formatEuro(total)}</td>
                      <td className="text-[#6a6a6a]">
                        {cart.updatedAt.toLocaleString("nl-NL")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const where = {
    storeId: store.id,
    ...(view === "draft" ? { status: "pending" } : {}),
  };

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (page > totalPages) page = totalPages;

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return (
    <div className="mx-auto max-w-[1080px]">
      <h1 className="text-[28px] font-semibold tracking-tight text-white">
        {title}
      </h1>
      {view === "draft" && (
        <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
          Pending orders awaiting payment
        </p>
      )}

      {total === 0 ? (
        <>
          <section className="admin-card admin-empty mt-8">
            <h2 className="text-[18px] font-medium text-white">
              {view === "draft"
                ? "No draft orders"
                : "Create and manage orders"}
            </h2>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#8b8b8b]">
              {view === "draft"
                ? "Draft and pending orders will show up here."
                : "You'll use this section to manage orders as they come through your storefront."}
            </p>
            <Link
              href={`/store/${store.subdomain}/shop`}
              target="_blank"
              className="admin-btn admin-btn-primary mt-7 px-4 py-2.5"
            >
              View storefront
            </Link>
          </section>
          <div className="mt-4 flex justify-center">
            <Link
              href="/admin/storefronts"
              className="inline-flex items-center gap-1.5 text-[13px] text-[#8b8b8b] hover:text-white"
            >
              <IconHelp />
              Learn more about orders
            </Link>
          </div>
        </>
      ) : (
        <div className="admin-card mt-8 overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#161616]">
                  <td>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-white hover:text-[#93c5fd]"
                    >
                      {o.number}
                    </Link>
                  </td>
                  <td className="text-[#a3a3a3]">
                    {o.customerName || o.email}
                  </td>
                  <td>{formatEuro(o.total)}</td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1.5 capitalize ${
                        o.status === "paid" || o.status === "fulfilled"
                          ? "text-[#93c5fd]"
                          : "text-[#8b8b8b]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          o.status === "paid" || o.status === "fulfilled"
                            ? "bg-[#3b82f6]"
                            : "bg-[#525252]"
                        }`}
                      />
                      {o.status}
                    </span>
                  </td>
                  <td className="text-[#6a6a6a]">
                    {o.createdAt.toLocaleString("nl-NL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Suspense fallback={null}>
            <OrdersPagination
              page={page}
              perPage={perPage}
              total={total}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
