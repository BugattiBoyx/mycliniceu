import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const HOSTNAME_RE =
  /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

function isApex(hostname: string) {
  return hostname.split(".").length === 2;
}

function vercelConfig() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_STOREFRONT_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) return null;
  return { token, projectId, teamId };
}

/**
 * "selfhost" = storefront runs behind our own reverse proxy, which issues
 * certificates on demand for any domain that resolves to a live store, so
 * connecting a domain is purely a DNS change.
 */
function domainProvider(): "vercel" | "selfhost" {
  const explicit = process.env.DOMAIN_PROVIDER;
  if (explicit === "vercel" || explicit === "selfhost") return explicit;
  return vercelConfig() ? "vercel" : "selfhost";
}

function dnsInstructions(hostname: string) {
  if (domainProvider() === "selfhost") {
    const ip = process.env.STOREFRONT_IP || "<storefront-server-ip>";
    const cname = process.env.STOREFRONT_CNAME;
    return isApex(hostname) || !cname
      ? {
          recordType: "A",
          recordName: isApex(hostname) ? "@" : hostname.split(".")[0],
          recordValue: ip,
        }
      : {
          recordType: "CNAME",
          recordName: hostname.split(".")[0],
          recordValue: cname,
        };
  }
  return isApex(hostname)
    ? { recordType: "A", recordName: "@", recordValue: "76.76.21.21" }
    : {
        recordType: "CNAME",
        recordName: hostname.split(".")[0],
        recordValue: "cname.vercel-dns.com",
      };
}

/** Attach the domain to the storefront host so it serves traffic over HTTPS. */
async function attachDomain(hostname: string) {
  if (domainProvider() === "selfhost") {
    // Nothing to provision: the storefront proxy issues a certificate the
    // first time the domain is requested, once DNS points at it.
    return { attached: true };
  }

  const cfg = vercelConfig();
  if (!cfg) return { attached: false, note: "Vercel automation not configured" };
  const qs = cfg.teamId ? `?teamId=${cfg.teamId}` : "";
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${cfg.projectId}/domains${qs}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: hostname }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (res.ok || data?.error?.code === "domain_already_in_use_by_project") {
    return { attached: true };
  }
  return {
    attached: false,
    note: data?.error?.message || `Vercel API error (${res.status})`,
  };
}

async function detachDomain(hostname: string) {
  if (domainProvider() === "selfhost") return;
  const cfg = vercelConfig();
  if (!cfg) return;
  const qs = cfg.teamId ? `?teamId=${cfg.teamId}` : "";
  await fetch(
    `https://api.vercel.com/v9/projects/${cfg.projectId}/domains/${hostname}${qs}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${cfg.token}` } },
  ).catch(() => undefined);
}

async function requireMember(storeId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.storeMember.findFirst({
    where: { storeId, userId: session.user.id },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const hostname = String(body.hostname || "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  const member = await requireMember(storeId);
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hostname || !HOSTNAME_RE.test(hostname)) {
    return NextResponse.json({ error: "Enter a valid domain, e.g. shop.example.com" }, { status: 400 });
  }

  const taken = await prisma.domain.findFirst({ where: { hostname } });
  if (taken && taken.storeId !== storeId) {
    return NextResponse.json(
      { error: "This domain is already connected to another store" },
      { status: 409 },
    );
  }

  const attach = await attachDomain(hostname);

  const domain = taken
    ? taken
    : await prisma.domain.create({
        data: {
          storeId,
          hostname,
          verified: attach.attached,
          isPrimary: false,
        },
      });

  await prisma.store.update({
    where: { id: storeId },
    data: { customDomain: hostname },
  });

  return NextResponse.json({
    ...domain,
    vercel: attach,
    dns: dnsInstructions(hostname),
  });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const domainId = String(body.domainId || "");

  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await requireMember(domain.storeId);
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await detachDomain(domain.hostname);
  await prisma.domain.delete({ where: { id: domainId } });

  // If this was the store's active custom domain, fall back to the next one.
  const store = await prisma.store.findUnique({ where: { id: domain.storeId } });
  if (store?.customDomain === domain.hostname) {
    const next = await prisma.domain.findFirst({
      where: { storeId: domain.storeId },
      orderBy: { createdAt: "desc" },
    });
    await prisma.store.update({
      where: { id: domain.storeId },
      data: { customDomain: next?.hostname ?? null },
    });
  }

  return NextResponse.json({ ok: true });
}
