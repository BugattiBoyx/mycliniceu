import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart-server";

export async function GET(req: Request) {
  const storeId = new URL(req.url).searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });
  const cart = await getOrCreateCart(storeId);
  return NextResponse.json(cart);
}

export async function POST(req: Request) {
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const variantId = String(body.variantId || "");
  const quantity = Math.max(1, Number(body.quantity) || 1);
  if (!storeId || !variantId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
  });
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const cart = await getOrCreateCart(storeId);
  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, quantity },
    update: { quantity: { increment: quantity } },
  });
  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  return NextResponse.json(updated);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const itemId = String(body.itemId || "");
  const quantity = Number(body.quantity);
  const cart = await getOrCreateCart(storeId);
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  } else {
    await prisma.cartItem.updateMany({
      where: { id: itemId, cartId: cart.id },
      data: { quantity },
    });
  }
  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  return NextResponse.json(updated);
}
