import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const member = await prisma.storeMember.findFirst({
    where: { storeId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data: Prisma.StoreUpdateInput = {};
  if (body.name) data.name = String(body.name);
  if (body.contactEmail != null) data.contactEmail = String(body.contactEmail);
  if (body.tagline != null) data.tagline = String(body.tagline);
  if (body.description != null) data.description = String(body.description);
  if (body.brandColor) data.brandColor = String(body.brandColor);
  if (body.legalPrivacy != null) data.legalPrivacy = String(body.legalPrivacy);
  if (body.legalTerms != null) data.legalTerms = String(body.legalTerms);
  if (body.stripePublishableKey != null) {
    data.stripePublishableKey = String(body.stripePublishableKey);
  }
  if (body.stripeSecretKey != null && body.stripeSecretKey !== "") {
    data.stripeSecretKey = String(body.stripeSecretKey);
  }

  await prisma.store.update({ where: { id: storeId }, data });
  return NextResponse.json({ ok: true });
}
