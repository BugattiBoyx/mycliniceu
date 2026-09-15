import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensurePaymentMethods, parseConfig } from "@/lib/payments";

/**
 * Generic high-risk processor webhook.
 * Expects JSON: { orderNumber, status: "paid"|"failed", secret? }
 * Or query: ?order=MJ-…&status=paid
 */
export async function POST(req: Request) {
  let payload: Record<string, unknown> = {};
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const url = new URL(req.url);
  const orderNumber = String(
    payload.orderNumber || payload.order || url.searchParams.get("order") || "",
  ).trim();
  const status = String(
    payload.status || url.searchParams.get("status") || "",
  )
    .trim()
    .toLowerCase();
  const secret = String(
    payload.secret ||
      req.headers.get("x-webhook-secret") ||
      url.searchParams.get("secret") ||
      "",
  );

  if (!orderNumber) {
    return NextResponse.json({ error: "orderNumber required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { number: orderNumber },
    include: { store: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const methods = await ensurePaymentMethods(order.storeId);
  const highRisk = methods.find((m) => m.type === "high_risk");
  const expected = parseConfig(highRisk?.config || null).webhookSecret;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  if (status === "paid" || status === "completed" || status === "success") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
  } else if (status === "failed" || status === "cancelled") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });
  }

  return NextResponse.json({ received: true, order: order.number });
}
