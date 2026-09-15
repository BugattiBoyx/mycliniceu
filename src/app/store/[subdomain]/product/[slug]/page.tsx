import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import { prisma } from "@/lib/db";
import { requireLiveStore, storeBasePath } from "@/lib/storefront";
import { AddToCart } from "./AddToCart";

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain, slug } = await params;
  const store = await requireLiveStore(subdomain);
  const product = await prisma.product.findFirst({
    where: { storeId: store.id, slug, status: "active" },
    include: { variants: { orderBy: { price: "asc" } } },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#eef3f3]">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="object-contain p-10"
          priority
        />
      </div>
      <div>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{product.name}</h1>
        <p className="mt-4 text-black/60">{product.description}</p>
        <AddToCart
          storeId={store.id}
          basePath={storeBasePath(subdomain)}
          brandColor={store.brandColor}
          variants={product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            price: v.price,
          }))}
        />
      </div>
    </div>
  );
}
