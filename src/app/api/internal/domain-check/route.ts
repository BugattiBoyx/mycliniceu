import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * On-demand TLS gate for the storefront reverse proxy.
 *
 * Caddy calls this before issuing a certificate for an unknown hostname, so a
 * merchant can point a brand-new domain at the storefront and get HTTPS with
 * no redeploy. Only hostnames that belong to a live store are approved —
 * without that check anyone could point DNS at us and burn ACME rate limits.
 *
 * The reverse proxy blocks /api/internal/* from the public internet; this is
 * only reachable inside the container network.
 */
export async function GET(req: Request) {
  const domain = new URL(req.url)
    .searchParams.get("domain")
    ?.toLowerCase()
    .split(":")[0]
    .trim();

  if (!domain) {
    return new NextResponse("missing domain", { status: 400 });
  }

  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "")
    .toLowerCase()
    .split(":")[0];

  // Platform apex, www, and the private admin hostname
  if (root && (domain === root || domain === `www.${root}` || domain === `admin.${root}`)) {
    return new NextResponse("ok", { status: 200 });
  }
  if (root && domain.endsWith(`.${root}`)) {
    const subdomain = domain.slice(0, -(root.length + 1));
    if (subdomain && subdomain !== "admin") {
      const store = await prisma.store.findFirst({
        where: { subdomain, status: "live" },
        select: { id: true },
      });
      return new NextResponse(store ? "ok" : "unknown domain", {
        status: store ? 200 : 404,
      });
    }
  }

  const store = await prisma.store.findFirst({
    where: {
      status: "live",
      OR: [
        { customDomain: domain },
        { domains: { some: { hostname: domain } } },
      ],
    },
    select: { id: true },
  });

  return new NextResponse(store ? "ok" : "unknown domain", {
    status: store ? 200 : 404,
  });
}
