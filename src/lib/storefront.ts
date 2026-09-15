import { notFound } from "next/navigation";
import { prisma } from "./db";

export async function getLiveStoreBySubdomain(subdomain: string) {
  const store = await prisma.store.findFirst({
    where: {
      subdomain,
      status: "live",
    },
    include: {
      products: {
        where: { status: "active" },
        include: { variants: { orderBy: { price: "asc" } } },
        orderBy: { name: "asc" },
      },
    },
  });
  return store;
}

export async function requireLiveStore(subdomain: string) {
  const store = await getLiveStoreBySubdomain(subdomain);
  if (!store) notFound();
  return store;
}

export function storeBasePath(subdomain: string) {
  return `/store/${subdomain}`;
}
