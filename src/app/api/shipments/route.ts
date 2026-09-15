import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isShipmentStatus, type ShipmentStatus } from "@/lib/shipment-constants";
import { syncOrderFulfillment } from "@/lib/shipments";

async function requireMember(userId: string, storeId: string) {
  return prisma.storeMember.findFirst({ where: { userId, storeId } });
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const shipmentId = String(body.shipmentId || "");
    if (!shipmentId) {
      return NextResponse.json({ error: "Missing shipment" }, { status: 400 });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });
    if (!shipment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const member = await requireMember(session.user.id, shipment.storeId);
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const carrier =
      body.carrier !== undefined
        ? String(body.carrier || "").trim() || null
        : shipment.carrier;
    const trackingNumber =
      body.trackingNumber !== undefined
        ? String(body.trackingNumber || "").trim() || null
        : shipment.trackingNumber;
    const trackingUrl =
      body.trackingUrl !== undefined
        ? String(body.trackingUrl || "").trim() || null
        : shipment.trackingUrl;
    const notes =
      body.notes !== undefined
        ? String(body.notes || "").trim() || null
        : shipment.notes;

    let nextStatus = body.status
      ? String(body.status).trim()
      : shipment.status;

    // Explicit shipped, or any tracking number → shipped
    if (nextStatus === "shipped" || nextStatus === "delivered") {
      nextStatus = "shipped";
    } else if (trackingNumber && nextStatus !== "cancelled") {
      nextStatus = "shipped";
    }

    if (!isShipmentStatus(nextStatus)) {
      return NextResponse.json(
        { error: `Invalid status: ${nextStatus}` },
        { status: 400 },
      );
    }

    const status = nextStatus as ShipmentStatus;
    let shippedAt = shipment.shippedAt;
    let deliveredAt = shipment.deliveredAt;

    if (status === "shipped") {
      shippedAt = shippedAt ?? new Date();
      deliveredAt = null;
    } else if (status === "unfulfilled" || status === "preparing") {
      shippedAt = null;
      deliveredAt = null;
    } else if (status === "cancelled") {
      // keep timestamps
    }

    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        carrier,
        trackingNumber,
        trackingUrl,
        notes,
        shippedAt,
        deliveredAt,
      },
    });

    try {
      await syncOrderFulfillment(shipment.orderId, status);
    } catch {
      // Shipment row is source of truth; don't fail the request
    }

    revalidatePath("/admin/shipments");
    revalidatePath(`/admin/orders/${shipment.orderId}`);
    revalidatePath("/admin");

    return NextResponse.json({
      shipment: {
        ...updated,
        shippedAt: updated.shippedAt?.toISOString() ?? null,
        deliveredAt: updated.deliveredAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("[shipments PATCH]", err);
    return NextResponse.json(
      { error: "Could not update shipment" },
      { status: 500 },
    );
  }
}
