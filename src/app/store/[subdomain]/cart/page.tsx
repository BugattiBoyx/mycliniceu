import Link from "next/link";
import { getOrCreateCart } from "@/lib/cart-server";
import { formatEuro } from "@/lib/format";
import { requireLiveStore, storeBasePath } from "@/lib/storefront";
import { CartControls } from "./CartControls";

export default async function StoreCartPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const store = await requireLiveStore(subdomain);
  const base = storeBasePath(subdomain);
  const cart = await getOrCreateCart(store.id);
  const total = cart.items.reduce((s, i) => s + i.variant.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold">Cart</h1>
      <div className="mt-8 space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white p-4"
          >
            <div>
              <p className="font-semibold">{item.variant.product.name}</p>
              <p className="text-sm text-black/50">{item.variant.label}</p>
              <p className="mt-1 text-sm font-medium">{formatEuro(item.variant.price)}</p>
            </div>
            <CartControls storeId={store.id} itemId={item.id} quantity={item.quantity} />
          </div>
        ))}
        {cart.items.length === 0 && (
          <p className="text-black/50">
            Your cart is empty.{" "}
            <Link href={`${base}/shop`} className="underline" style={{ color: store.brandColor }}>
              Continue shopping
            </Link>
          </p>
        )}
      </div>
      {cart.items.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
          <p className="text-lg font-semibold">Total {formatEuro(total)}</p>
          <Link
            href={`${base}/checkout`}
            className="rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: store.brandColor }}
          >
            Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
