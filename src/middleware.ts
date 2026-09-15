import { NextRequest, NextResponse } from "next/server";

const PASSTHROUGH =
  /^\/(api|_next|admin|login|signup|store|favicon\.ico|brand|products|.*\..+)/;

// Deployment roles keep the control plane and the storefronts on separate
// deployments (same codebase, shared database):
//   - "admin":      private project — dashboard + APIs only, no storefront
//   - "storefront": public project — storefronts + checkout, no admin/login
//   - unset:        combined (local dev)
const ROLE = process.env.DEPLOYMENT_ROLE || "combined";

// Paths that must never exist on customer-facing storefront deployments.
const ADMIN_ONLY = /^\/(admin|login|signup|api\/auth)(\/|$)/;

// The only APIs a storefront needs. Everything else (products, payments,
// stores, settings, upload…) is management surface and stays on the control
// plane, so a seized edge box cannot be used to mutate the platform.
const STOREFRONT_APIS =
  /^\/api\/(checkout|cart|resolve-host|health|webhooks\/[\w-]+|internal\/domain-check)(\/|$)/;

const IPV4_HOST = /^(\d{1,3}\.){3}\d{1,3}$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = (req.headers.get("host") || "").split(":")[0].toLowerCase();

  // Storefront and admin are domain-only unless bootstrap mode is enabled
  // (ALLOW_IP_ACCESS=true — use before DNS is connected).
  if (
    IPV4_HOST.test(hostname) &&
    hostname !== "127.0.0.1" &&
    process.env.ALLOW_IP_ACCESS !== "true"
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (ROLE === "storefront") {
    if (ADMIN_ONLY.test(pathname)) {
      return new NextResponse("Not Found", { status: 404 });
    }
    if (pathname.startsWith("/api/") && !STOREFRONT_APIS.test(pathname)) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  if (ROLE === "admin") {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    // Only the dashboard, auth and APIs live here; no storefront pages.
    if (!PASSTHROUGH.test(pathname)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (PASSTHROUGH.test(pathname)) {
    return NextResponse.next();
  }

  const base = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000")
    .toLowerCase()
    .split(":")[0];

  // Private admin hostname → dashboard (infra), never the public storefront home.
  if (hostname === `admin.${base}`) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Platform apex / www → leave alone (marketing + admin links)
  if (
    hostname === base ||
    hostname === `www.${base}` ||
    hostname === "localhost" ||
    hostname.endsWith(".vercel.app")
  ) {
    // On Vercel preview/production apex, still allow path-based /store/*
    return NextResponse.next();
  }

  let subdomain: string | null = null;

  if (hostname.endsWith(`.${base}`)) {
    const sub = hostname.slice(0, -(base.length + 1));
    if (sub && sub !== "www" && sub !== "admin") subdomain = sub;
  } else {
    try {
      const origin = req.nextUrl.origin;
      const res = await fetch(
        `${origin}/api/resolve-host?host=${encodeURIComponent(hostname)}`,
        { headers: { "x-middleware-resolve": "1" } },
      );
      if (res.ok) {
        const data = (await res.json()) as { subdomain?: string | null };
        subdomain = data.subdomain || null;
      }
    } catch {
      subdomain = null;
    }
  }

  if (!subdomain) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname =
    pathname === "/"
      ? `/store/${subdomain}`
      : `/store/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
