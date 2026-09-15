import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/format";
import {
  hasShippingInfo,
  parseOrderMeta,
  paymentMethodLabel,
} from "@/lib/order-meta";
import { requireUser } from "@/lib/session";
import { shipmentStatusLabel } from "@/lib/shipment-constants";

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "blue" | "amber" | "red" | "muted";
}) {
  const tones = {
    green: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
    blue: "bg-[#3b82f6]/15 text-[#7eb0ff] ring-[#3b82f6]/25",
    amber: "bg-amber-500/15 text-amber-300 ring-amber-500/20",
    red: "bg-red-500/15 text-red-400 ring-red-500/20",
    muted: "bg-white/5 text-[#8b8b8b] ring-white/10",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize ring-1 ring-inset ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function orderTone(status: string): "green" | "blue" | "amber" | "red" | "muted" {
  if (status === "paid" || status === "fulfilled") return "green";
  if (status === "pending") return "amber";
  if (status === "refunded" || status === "cancelled") return "red";
  return "muted";
}

function shipTone(status: string): "green" | "blue" | "amber" | "red" | "muted" {
  if (status === "shipped" || status === "delivered") return "blue";
  if (status === "preparing") return "amber";
  if (status === "cancelled") return "muted";
  return "amber";
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6a6a6a]">
        {label}
      </dt>
      <dd className="mt-1 text-[13.5px] text-[#e8e8e8]">{children}</dd>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) notFound();

  const order = await prisma.order.findFirst({
    where: { id, storeId: store.id },
    include: {
      customer: true,
      shipment: true,
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const meta = parseOrderMeta(order.shippingAddress);
  const phone = meta.phone || order.customer?.phone || "";
  const itemsSubtotal = order.items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const fulfillStatus = order.shipment?.status || "unfulfilled";
  const customerName =
    order.customerName || order.customer?.name || order.email;

  return (
    <div className="mx-auto max-w-[900px]">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-[13px] text-[#8b8b8b] transition hover:text-white"
      >
        ← Orders
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[28px] font-semibold tracking-tight text-white">
              {order.number}
            </h1>
            <StatusPill label={order.status} tone={orderTone(order.status)} />
            <StatusPill
              label={shipmentStatusLabel(fulfillStatus)}
              tone={shipTone(fulfillStatus)}
            />
          </div>
          <p className="mt-2 text-[13.5px] text-[#8b8b8b]">
            {order.createdAt.toLocaleString("nl-NL")} · {itemCount} item
            {itemCount === 1 ? "" : "s"} · {formatEuro(order.total)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.customerId && (
            <Link
              href={`/admin/customers/${order.customerId}`}
              className="admin-btn admin-btn-ghost"
            >
              Customer
            </Link>
          )}
          <Link href="/admin/shipments" className="admin-btn admin-btn-primary">
            Manage shipment
          </Link>
        </div>
      </header>

      <section className="admin-card mt-7 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1f1f1f] px-5 py-3.5">
          <h2 className="text-[14px] font-medium text-white">Items</h2>
          <span className="text-[12px] text-[#6a6a6a]">
            {order.items.length} line{order.items.length === 1 ? "" : "s"}
          </span>
        </div>
        <ul className="divide-y divide-[#1f1f1f]">
          {order.items.map((item) => {
            const imageUrl =
              item.variant?.product?.imageUrl || "/products/mounjaro.png";
            return (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a] ring-1 ring-[#262626]">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[12.5px] text-[#8b8b8b]">
                    {item.variantLabel || "Default"}
                    <span className="mx-1.5 text-[#3a3a3a]">·</span>
                    Qty {item.quantity}
                    <span className="mx-1.5 text-[#3a3a3a]">·</span>
                    {formatEuro(item.unitPrice)} each
                  </p>
                </div>
                <p className="shrink-0 text-[14px] font-medium text-white">
                  {formatEuro(item.unitPrice * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[#1f1f1f] px-5 py-4">
          <div className="space-y-1.5 text-[13px]">
            <div className="flex gap-6">
              <span className="text-[#8b8b8b]">Subtotal</span>
              <span className="text-[#e8e8e8]">{formatEuro(itemsSubtotal)}</span>
            </div>
            {Math.abs(itemsSubtotal - order.total) > 0.009 && (
              <div className="flex gap-6">
                <span className="text-[#8b8b8b]">Adjustments</span>
                <span className="text-[#e8e8e8]">
                  {formatEuro(order.total - itemsSubtotal)}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6a6a6a]">
              Total
            </p>
            <p className="mt-0.5 text-[20px] font-semibold tracking-tight text-white">
              {formatEuro(order.total)}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="admin-card p-5">
          <h2 className="text-[14px] font-medium text-white">Customer</h2>
          <dl className="mt-4 grid gap-3.5">
            <Meta label="Name">{customerName}</Meta>
            <Meta label="Email">
              <a
                href={`mailto:${order.email}`}
                className="text-[#7eb0ff] hover:underline"
              >
                {order.email}
              </a>
            </Meta>
            {phone && (
              <Meta label="Phone">
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="hover:underline"
                >
                  {phone}
                </a>
              </Meta>
            )}
          </dl>
          {order.customerId && (
            <Link
              href={`/admin/customers/${order.customerId}`}
              className="mt-4 inline-block text-[12.5px] text-[#5b8def] hover:underline"
            >
              View customer profile
            </Link>
          )}
        </section>

        <section className="admin-card p-5">
          <h2 className="text-[14px] font-medium text-white">
            Shipping address
          </h2>
          {hasShippingInfo(meta) ? (
            <div className="mt-4 space-y-1 text-[13.5px] leading-relaxed text-[#e8e8e8]">
              <p className="font-medium text-white">{customerName}</p>
              {meta.address && <p>{meta.address}</p>}
              <p>{[meta.zip, meta.city].filter(Boolean).join(" ")}</p>
              {meta.country && <p>{meta.country}</p>}
              {phone && <p className="pt-2 text-[#8b8b8b]">{phone}</p>}
            </div>
          ) : (
            <p className="mt-4 text-[13px] text-[#6a6a6a]">
              No shipping address on this order
            </p>
          )}
        </section>

        <section className="admin-card p-5">
          <h2 className="text-[14px] font-medium text-white">Payment</h2>
          <dl className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <Meta label="Method">
              {paymentMethodLabel(meta.paymentMethod)}
            </Meta>
            <Meta label="Status">
              <span className="capitalize">{order.status}</span>
            </Meta>
            <Meta label="Currency">{order.currency || "EUR"}</Meta>
            {meta.providerName && (
              <Meta label="Processor">{meta.providerName}</Meta>
            )}
            {meta.iban && (
              <Meta label="IBAN">
                <span className="font-mono text-[12.5px]">{meta.iban}</span>
              </Meta>
            )}
            {meta.accountName && (
              <Meta label="Account">{meta.accountName}</Meta>
            )}
          </dl>
        </section>

        <section className="admin-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium text-white">Shipment</h2>
            <StatusPill
              label={shipmentStatusLabel(fulfillStatus)}
              tone={shipTone(fulfillStatus)}
            />
          </div>
          {order.shipment ? (
            <dl className="mt-4 grid gap-3.5 sm:grid-cols-2">
              <Meta label="Carrier">
                {order.shipment.carrier || "Not set"}
              </Meta>
              <Meta label="Tracking">
                {order.shipment.trackingNumber ? (
                  order.shipment.trackingUrl ? (
                    <a
                      href={order.shipment.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[12.5px] text-[#7eb0ff] hover:underline"
                    >
                      {order.shipment.trackingNumber}
                    </a>
                  ) : (
                    <span className="font-mono text-[12.5px]">
                      {order.shipment.trackingNumber}
                    </span>
                  )
                ) : (
                  "Not set"
                )}
              </Meta>
              {order.shipment.shippedAt && (
                <Meta label="Shipped">
                  {order.shipment.shippedAt.toLocaleString("nl-NL")}
                </Meta>
              )}
              {order.shipment.notes && (
                <Meta label="Notes">{order.shipment.notes}</Meta>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-[13px] text-[#6a6a6a]">
              No shipment record yet.
            </p>
          )}
          <Link
            href="/admin/shipments"
            className="mt-4 inline-flex text-[12.5px] text-[#5b8def] hover:underline"
          >
            Open shipments →
          </Link>
        </section>
      </div>
    </div>
  );
}
