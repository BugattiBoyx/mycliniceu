import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const member = await prisma.storeMember.findFirst({
    where: { storeId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const code = String(body.code || "").trim().toUpperCase();
  const type = body.type === "fixed" ? "fixed" : "percent";
  const value = Number(body.value);
  if (!code || !value) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const discount = await prisma.discount.create({
    data: { storeId, code, type, value, active: true },
  });
  return NextResponse.json(discount);
}
