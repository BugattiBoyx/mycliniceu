import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { formatEuro } from "@/lib/format";
import { requireLiveStore, storeBasePath } from "@/lib/storefront";

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const store = await requireLiveStore(subdomain);
  const base = storeBasePath(subdomain);
  const brand = store.brandColor || "#004751";
  const prices = store.products.flatMap((p) => p.variants.map((v) => v.price));
  const from = prices.length ? Math.min(...prices) : 0;

  return (
    <>
      <section className="bg-[#eef3f3] pt-16 pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {store.tagline || "Wetenschappelijk bewezen gewichtsverlies"}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-black/60">
              {store.description ||
                "Bereik een gezond gewicht met medicatie ondersteund door wetenschap."}
            </p>
            {from > 0 && (
              <p className="mt-6 text-2xl font-semibold" style={{ color: brand }}>
                Vanaf {formatEuro(from)}
                <span className="text-base font-medium text-black/50"> / maand</span>
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${base}/shop`}
                className="rounded-full px-6 py-3 text-sm font-semibold text-white"
                style={{ background: brand }}
              >
                Bekijk behandelingen
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-white shadow-xl">
            <Image
              src={store.previewImage || "/products/mounjaro.png"}
              alt={store.name}
              fill
              className="object-contain p-8"
              priority
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-semibold">Behandelingen</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {store.products.map((product) => {
              const lo = Math.min(...product.variants.map((v) => v.price));
              const hi = Math.max(...product.variants.map((v) => v.price));
              return (
                <Link
                  key={product.id}
                  href={`${base}/product/${product.slug}`}
                  className="overflow-hidden rounded-[2rem] border border-black/5 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-[#eef3f3]">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-contain p-8"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-2xl font-semibold">{product.name}</h3>
                    <p className="mt-2 text-sm text-black/55">{product.description}</p>
                    <p className="mt-4 font-semibold" style={{ color: brand }}>
                      {formatEuro(lo)}
                      {hi !== lo ? ` – ${formatEuro(hi)}` : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
            {store.products.length === 0 && (
              <p className="text-black/50">No products yet.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
