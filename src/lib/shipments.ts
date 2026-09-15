import "server-only";

import { prisma } from "./db";
import type { ShipmentStatus } from "./shipment-constants";

export {
  CARRIERS,
  SHIPMENT_STATUSES,
  isShipmentStatus,
  shipmentStatusLabel,
  type ShipmentStatus,
} from "./shipment-constants";

/** Create missing shipment rows for shippable orders (paid / fulfilled). */
export async function ensureShipmentsForStore(storeId: string) {
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      status: { in: ["paid", "fulfilled", "pending"] },
      shipment: null,
    },
    select: { id: true, status: true },
  });

  for (const order of orders) {
    const status =
      order.status === "fulfilled" ? "shipped" : "unfulfilled";
    await prisma.shipment.create({
      data: {
        storeId,
        orderId: order.id,
        status,
        shippedAt: status === "shipped" ? new Date() : null,
      },
    });
  }
}

export async function syncOrderFulfillment(
  orderId: string,
  shipmentStatus: ShipmentStatus,
) {
  if (shipmentStatus === "shipped" || shipmentStatus === "delivered") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "fulfilled" },
    });
  } else if (shipmentStatus === "cancelled") {
    // leave order status as-is
  } else {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.status === "fulfilled") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "paid" },
      });
    }
  }
}
