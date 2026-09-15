import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/format";
import { requireUser } from "@/lib/session";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) notFound();

  const customer = await prisma.customer.findFirst({
    where: { id, storeId: store.id },
    include: {
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) notFound();

  const paidOrders = customer.orders.filter(
    (o) => o.status === "paid" || o.status === "fulfilled",
  );
  const totalSpent = paidOrders.reduce((s, o) => s + o.total, 0);
  const pendingCount = customer.orders.filter((o) => o.status === "pending").length;
  const lastOrder = customer.orders[0] || null;

  return (
    <div className="mx-auto max-w-[1080px]">
      <Link
        href="/admin/customers"
        className="text-[13px] text-[#8b8b8b] hover:text-white"
      >
        ← Customers
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            {customer.name || customer.email}
          </h1>
          <p className="mt-1.5 text-[14px] text-[#8b8b8b]">{customer.email}</p>
        </div>
        <a
          href={`mailto:${customer.email}`}
          className="admin-btn admin-btn-soft"
        >
          Email customer
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Orders", value: String(customer.orders.length) },
          { label: "Total spent", value: formatEuro(totalSpent) },
          { label: "Pending", value: String(pendingCount) },
          {
            label: "Customer since",
            value: customer.createdAt.toLocaleDateString("nl-NL"),
          },
        ].map((card) => (
          <div key={card.label} className="admin-card p-4">
            <p className="text-[12.5px] text-[#8b8b8b]">{card.label}</p>
            <p className="mt-2 text-[22px] font-semibold tracking-tight">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="admin-card space-y-3 p-5 text-[13px]">
          <p className="text-[14px] font-medium text-white">Profile</p>
          <div className="flex justify-between gap-3">
            <span className="text-[#6a6a6a]">Name</span>
            <span className="text-right text-white">
              {customer.name || "—"}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#6a6a6a]">Email</span>
            <span className="text-right text-white">{customer.email}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#6a6a6a]">Phone</span>
            <span className="text-right text-white">
              {customer.phone || "—"}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#6a6a6a]">Joined</span>
            <span className="text-right text-white">
              {customer.createdAt.toLocaleString("nl-NL")}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#6a6a6a]">Last order</span>
            <span className="text-right text-white">
              {lastOrder
                ? lastOrder.createdAt.toLocaleDateString("nl-NL")
                : "—"}
            </span>
          </div>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="border-b border-[#1f1f1f] px-5 py-3.5">
            <p className="text-[14px] font-medium text-white">Order history</p>
          </div>
          {customer.orders.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-[#6a6a6a]">
              No orders yet
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#161616]">
                    <td>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-white hover:text-[#93c5fd]"
                      >
                        {o.number}
                      </Link>
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
          )}
        </div>
      </div>
    </div>
  );
}
