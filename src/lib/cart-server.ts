import { cookies } from "next/headers";
import { prisma } from "./db";
import { nanoid } from "nanoid";

export async function getOrCreateCart(storeId: string) {
  const cookieStore = await cookies();
  const key = `cart_${storeId}`;
  let token = cookieStore.get(key)?.value;
  if (token) {
    const existing = await prisma.cart.findUnique({
      where: { token },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
    if (existing && existing.storeId === storeId) return existing;
  }
  token = nanoid(24);
  const cart = await prisma.cart.create({
    data: { token, storeId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  cookieStore.set(key, token, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  return cart;
}
