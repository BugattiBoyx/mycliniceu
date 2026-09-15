import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { EditProductForm } from "./EditProductForm";

function parseGallery(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) notFound();

  const product = await prisma.product.findFirst({
    where: { id, storeId: store.id },
    include: { variants: { orderBy: { price: "asc" } } },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-2">
        <Link
          href="/admin/products"
          className="text-[13px] text-[#8b8b8b] hover:text-white"
        >
          ← Products
        </Link>
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight">Edit product</h1>
      <p className="mt-1.5 text-[14px] text-[#8b8b8b]">{store.name}</p>
      <EditProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          imageUrl: product.imageUrl || "/products/mounjaro.png",
          galleryUrls: parseGallery(product.galleryUrls),
          status: product.status,
          variants: product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            price: String(v.price),
            stock: String(v.stock),
          })),
        }}
      />
    </div>
  );
}
