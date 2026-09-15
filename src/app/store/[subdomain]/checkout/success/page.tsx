import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/format";
import { parseOrderMeta } from "@/lib/order-meta";
import { requireLiveStore, storeBasePath } from "@/lib/storefront";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  const { subdomain } = await params;
  const { order: orderNumber, method } = await searchParams;
  const store = await requireLiveStore(subdomain);
  const order = orderNumber
    ? await prisma.order.findFirst({
        where: { storeId: store.id, number: orderNumber },
        include: { items: true },
      })
    : null;

  const meta = parseOrderMeta(order?.shippingAddress);

  const payMethod = method || meta.paymentMethod || "";
  const pending = order?.status === "pending";

  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">
        {pending
          ? payMethod === "crypto"
            ? "Send crypto payment"
            : payMethod === "bank" || payMethod === "bank_transfer"
              ? "Complete your transfer"
              : payMethod === "high_risk"
                ? "Complete payment"
                : "Order received"
          : "Thank you"}
      </h1>
      <p className="mt-3 text-black/55">
        {order
          ? `Order ${order.number} · ${formatEuro(order.total)} · ${order.status}`
          : "Your order was received."}
      </p>

      {pending && (payMethod === "bank" || payMethod === "bank_transfer") && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-left text-sm">
          <p className="font-semibold">Bank transfer details</p>
          {meta.accountName && (
            <p className="mt-2 text-black/70">Name: {meta.accountName}</p>
          )}
          {meta.iban && (
            <p className="mt-1 font-mono text-black/80">IBAN: {meta.iban}</p>
          )}
          {meta.bic && (
            <p className="mt-1 font-mono text-black/70">BIC: {meta.bic}</p>
          )}
          <p className="mt-1 text-black/70">
            Amount: {order ? formatEuro(order.total) : "—"}
          </p>
          <p className="mt-1 text-black/70">Reference: {order?.number}</p>
          {meta.instructions && (
            <p className="mt-3 text-black/55">{meta.instructions}</p>
          )}
        </div>
      )}

      {pending && payMethod === "crypto" && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-left text-sm">
          <p className="font-semibold">Crypto payment details</p>
          <p className="mt-2 text-black/70">
            Amount: {order ? formatEuro(order.total) : "—"}
          </p>
          <p className="mt-1 text-black/70">Reference: {order?.number}</p>
          {meta.btcAddress && (
            <p className="mt-3 break-all font-mono text-[12px] text-black/80">
              BTC: {meta.btcAddress}
            </p>
          )}
          {meta.ethAddress && (
            <p className="mt-2 break-all font-mono text-[12px] text-black/80">
              ETH: {meta.ethAddress}
            </p>
          )}
          {meta.usdtAddress && (
            <p className="mt-2 break-all font-mono text-[12px] text-black/80">
              USDT: {meta.usdtAddress}
            </p>
          )}
          {meta.networkNotes && (
            <p className="mt-3 text-black/55">{meta.networkNotes}</p>
          )}
          {meta.instructions && (
            <p className="mt-2 text-black/55">{meta.instructions}</p>
          )}
        </div>
      )}

      {pending && payMethod === "high_risk" && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-left text-sm">
          <p className="font-semibold">
            {meta.providerName || "Payment processor"}
          </p>
          <p className="mt-2 text-black/55">
            {meta.instructions ||
              "Complete payment with our payment partner. Your order will update once the processor confirms."}
          </p>
          <p className="mt-3 text-black/70">Reference: {order?.number}</p>
        </div>
      )}

      {order && (
        <ul className="mt-6 space-y-2 text-left text-sm">
          {order.items.map((i) => (
            <li
              key={i.id}
              className="rounded-xl border border-black/5 bg-white px-4 py-3"
            >
              {i.title} ({i.variantLabel}) × {i.quantity}
            </li>
          ))}
        </ul>
      )}
      <Link
        href={storeBasePath(subdomain)}
        className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
        style={{ background: store.brandColor }}
      >
        Back to store
      </Link>
    </div>
  );
}
