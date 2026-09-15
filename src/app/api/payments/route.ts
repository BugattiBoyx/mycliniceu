import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  demoPaymentsAllowed,
  ensurePaymentMethods,
  parseConfig,
} from "@/lib/payments";

async function requireMember(storeId: string, userId: string) {
  return prisma.storeMember.findFirst({ where: { storeId, userId } });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = new URL(req.url).searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });
  const member = await requireMember(storeId, session.user.id);
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const methods = await ensurePaymentMethods(storeId);
  return NextResponse.json(methods);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const member = await requireMember(storeId, session.user.id);
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensurePaymentMethods(storeId);

  if (!body.methodId) {
    return NextResponse.json({ error: "methodId required" }, { status: 400 });
  }

  const method = await prisma.paymentMethod.findFirst({
    where: { id: String(body.methodId), storeId },
  });
  if (!method) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: {
    enabled?: boolean;
    isDefault?: boolean;
    name?: string;
    config?: string;
  } = {};

  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (body.name) data.name = String(body.name);
  if (body.config && typeof body.config === "object") {
    data.config = JSON.stringify({
      ...parseConfig(method.config),
      ...body.config,
    });
  }
  if (body.isDefault === true) {
    await prisma.paymentMethod.updateMany({
      where: { storeId },
      data: { isDefault: false },
    });
    data.isDefault = true;
    data.enabled = true;
  }

  // Test payment mode hard-blocked when ALLOW_DEMO_PAYMENTS=false
  if (
    method.type === "demo" &&
    (data.enabled === true || body.isDefault === true) &&
    !demoPaymentsAllowed()
  ) {
    return NextResponse.json(
      {
        error:
          "Test payment mode is locked by ALLOW_DEMO_PAYMENTS=false. Remove that env var to allow testing.",
      },
      { status: 403 },
    );
  }

  // Turning off test mode: clear default so a live method can take over
  if (method.type === "demo" && data.enabled === false) {
    data.isDefault = false;
  }

  const updated = await prisma.paymentMethod.update({
    where: { id: method.id },
    data,
  });
  return NextResponse.json(updated);
}
