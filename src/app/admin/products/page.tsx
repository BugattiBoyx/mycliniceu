import Image from "next/image";
import Link from "next/link";
import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DeleteProductButton } from "./DeleteProductButton";

export default async function ProductsPage() {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) {
    return (
      <div className="mx-auto max-w-[1080px]">
        <h1 className="text-[28px] font-semibold tracking-tight">Products</h1>
        <p className="mt-4 text-[14px] text-[#8b8b8b]">Create a storefront first.</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Products</h1>
          <p className="mt-1.5 text-[14px] text-[#8b8b8b]">{store.name}</p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <section className="admin-card admin-empty mt-8">
          <h2 className="text-[18px] font-medium">Add your first product</h2>
          <p className="mt-3 max-w-md text-[14px] text-[#8b8b8b]">
            Products appear on your live storefront once published.
          </p>
          <Link
            href="/admin/products/new"
            className="admin-btn admin-btn-primary mt-6 px-4 py-2.5"
          >
            Add product
          </Link>
        </section>
      ) : (
        <div className="admin-card mt-8 overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variants</th>
                <th>Price</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const prices = p.variants.map((v) => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                const thumb = p.imageUrl || "/products/mounjaro.png";
                const remote = thumb.startsWith("http") || thumb.startsWith("data:");
                return (
                  <tr key={p.id} className="hover:bg-[#161616]">
                    <td>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-3 font-medium text-white hover:text-[#93c5fd]"
                      >
                        <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#262626] bg-[#0a0a0a]">
                          {remote ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Image
                              src={thumb}
                              alt=""
                              fill
                              className="object-contain p-1"
                            />
                          )}
                        </span>
                        <span>{p.name}</span>
                      </Link>
                    </td>
                    <td className="text-[#8b8b8b]">{p.variants.length}</td>
                    <td>
                      {min === max
                        ? `€${min.toFixed(2)}`
                        : `€${min.toFixed(2)} – €${max.toFixed(2)}`}
                    </td>
                    <td className="capitalize text-[#8b8b8b]">{p.status}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-[13px] text-[#93c5fd] hover:text-white"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton productId={p.id} />
                      </div>
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
