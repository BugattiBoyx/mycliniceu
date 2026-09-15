import { cookies } from "next/headers";
import { prisma } from "./db";

export async function getActiveStore(userId: string) {
  const memberships = await prisma.storeMember.findMany({
    where: { userId },
    include: { store: true },
    orderBy: { store: { createdAt: "asc" } },
  });
  const stores = memberships.map((m) => m.store);
  if (stores.length === 0) return { stores, store: null };

  const cookieStore = await cookies();
  const activeId = cookieStore.get("activeStoreId")?.value;
  const store =
    stores.find((s) => s.id === activeId) ||
    stores.find((s) => s.isPrimary) ||
    stores[0];
  return { stores, store };
}
