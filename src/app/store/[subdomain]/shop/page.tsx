import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { formatEuro } from "@/lib/format";
import { requireLiveStore, storeBasePath } from "@/lib/storefront";

export default async function StoreShopPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const store = await requireLiveStore(subdomain);
  const base = storeBasePath(subdomain);
  const brand = store.brandColor || "#004751";

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold">Shop</h1>
      <p className="mt-2 text-black/55">{store.tagline}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {store.products.map((product) => {
          const from = Math.min(...product.variants.map((v) => v.price));
          return (
            <Link
              key={product.id}
              href={`${base}/product/${product.slug}`}
              className="rounded-3xl border border-black/5 bg-white p-4 transition hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eef3f3]">
                <ProductImage src={product.imageUrl} alt={product.name} />
              </div>
              <h2 className="mt-4 font-semibold">{product.name}</h2>
              <p className="mt-1 font-medium" style={{ color: brand }}>
                From {formatEuro(from)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
