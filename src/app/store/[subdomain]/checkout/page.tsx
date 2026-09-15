import { getOrCreateCart } from "@/lib/cart-server";
import { formatEuro } from "@/lib/format";
import { ensurePaymentMethods } from "@/lib/payments";
import { requireLiveStore, storeBasePath } from "@/lib/storefront";
import { CheckoutForm } from "./CheckoutForm";

export default async function StoreCheckoutPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const store = await requireLiveStore(subdomain);
  const cart = await getOrCreateCart(store.id);
  const total = cart.items.reduce((s, i) => s + i.variant.price * i.quantity, 0);
  const methods = (await ensurePaymentMethods(store.id)).filter((m) => m.enabled);

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-black/55">
        {cart.items.length} item(s) · {formatEuro(total)}
      </p>
      {cart.items.length === 0 ? (
        <p className="mt-8 text-black/50">Cart is empty.</p>
      ) : methods.length === 0 ? (
        <p className="mt-8 text-black/50">
          Payments are not configured for this store yet.
        </p>
      ) : (
        <CheckoutForm
          storeId={store.id}
          brandColor={store.brandColor}
          basePath={storeBasePath(subdomain)}
          methods={methods.map((m) => ({
            type: m.type,
            name: m.name,
            isDefault: m.isDefault,
          }))}
        />
      )}
    </div>
  );
}
