import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const host = new URL(req.url).searchParams.get("host")?.toLowerCase().split(":")[0];
  if (!host) return NextResponse.json({ subdomain: null });

  const base = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost").toLowerCase().split(":")[0];

  if (host.endsWith(`.${base}`)) {
    const subdomain = host.slice(0, -(base.length + 1));
    if (subdomain && subdomain !== "www" && subdomain !== "admin") {
      const store = await prisma.store.findFirst({
        where: { subdomain, status: "live" },
        select: { subdomain: true },
      });
      return NextResponse.json({ subdomain: store?.subdomain ?? null });
    }
  }

  const store = await prisma.store.findFirst({
    where: {
      status: "live",
      OR: [{ customDomain: host }, { domains: { some: { hostname: host, verified: true } } }],
    },
    select: { subdomain: true },
  });

  return NextResponse.json({ subdomain: store?.subdomain ?? null });
}
