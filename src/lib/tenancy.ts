import { prisma } from "./db";

export async function resolveStoreByHost(host: string) {
  const hostname = host.split(":")[0].toLowerCase();
  const base = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost").toLowerCase();

  if (hostname === base || hostname === `www.${base}` || hostname === "localhost") {
    return null;
  }

  if (hostname.endsWith(`.${base}`)) {
    const subdomain = hostname.slice(0, -(base.length + 1));
    if (!subdomain || subdomain === "www" || subdomain === "admin") return null;
    return prisma.store.findFirst({
      where: { subdomain, status: "live" },
      include: {
        products: { where: { status: "active" }, include: { variants: true } },
      },
    });
  }

  const byCustom = await prisma.store.findFirst({
    where: {
      OR: [{ customDomain: hostname }, { domains: { some: { hostname, verified: true } } }],
      status: "live",
    },
    include: {
      products: { where: { status: "active" }, include: { variants: true } },
    },
  });
  return byCustom;
}

export async function getStoreForUser(userId: string, storeId: string) {
  return prisma.store.findFirst({
    where: { id: storeId, members: { some: { userId } } },
  });
}

export async function requireStoreAccess(userId: string, storeId: string) {
  const store = await getStoreForUser(userId, storeId);
  if (!store) throw new Error("Store not found or access denied");
  return store;
}

export function storePublicUrl(store: { subdomain: string; customDomain: string | null }) {
  if (store.customDomain) return `https://${store.customDomain}`;
  const base = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const proto = base.includes("localhost") ? "http" : "https";
  if (base.includes("localhost")) {
    return `${proto}://${base}/store/${store.subdomain}`;
  }
  return `${proto}://${store.subdomain}.${base}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
