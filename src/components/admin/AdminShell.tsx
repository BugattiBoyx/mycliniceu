"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Suspense, useState } from "react";
import {
  IconChat,
  IconChevron,
  IconCustomers,
  IconDiscounts,
  IconDomains,
  IconHome,
  IconMore,
  IconOrders,
  IconPayments,
  IconProducts,
  IconSettings,
  IconShipments,
  IconStore,
} from "./icons";

type NavChild = { href: string; label: string; match?: { param: string; value: string } };
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
};

const mainNav: NavItem[] = [
  { href: "/admin", label: "Home", icon: IconHome },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: IconOrders,
    children: [
      { href: "/admin/orders", label: "All orders", match: { param: "view", value: "all" } },
      {
        href: "/admin/orders?view=draft",
        label: "Draft orders",
        match: { param: "view", value: "draft" },
      },
      {
        href: "/admin/orders?view=carts",
        label: "Carts",
        match: { param: "view", value: "carts" },
      },
    ],
  },
  { href: "/admin/shipments", label: "Shipments", icon: IconShipments },
  { href: "/admin/customers", label: "Customers", icon: IconCustomers },
  { href: "/admin/products", label: "Products", icon: IconProducts },
  { href: "/admin/discounts", label: "Discounts", icon: IconDiscounts },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: IconPayments,
    children: [
      {
        href: "/admin/payments",
        label: "Payment methods",
        match: { param: "tab", value: "methods" },
      },
      {
        href: "/admin/payments?tab=high_risk",
        label: "High-risk processor",
        match: { param: "tab", value: "high_risk" },
      },
      {
        href: "/admin/payments?tab=crypto",
        label: "Crypto",
        match: { param: "tab", value: "crypto" },
      },
      {
        href: "/admin/payments?tab=bank",
        label: "Bank transfer",
        match: { param: "tab", value: "bank" },
      },
    ],
  },
];

const channelNav: NavItem[] = [
  { href: "/admin/storefronts", label: "Themes", icon: IconStore },
  { href: "/admin/domains", label: "Domains", icon: IconDomains },
];

const adminNav: NavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

const navLinkClass =
  "outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6]/50 focus-visible:ring-offset-0";

function isChildActive(
  child: NavChild,
  pathname: string,
  searchParams: URLSearchParams,
) {
  const path = child.href.split("?")[0];
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;

  if (!child.match) return true;

  const current = searchParams.get(child.match.param);
  if (child.match.value === "all" || child.match.value === "methods") {
    return !current || current === child.match.value;
  }
  return current === child.match.value;
}

function NavLink({
  item,
  pathname,
  searchParams,
}: {
  item: NavItem;
  pathname: string;
  searchParams: URLSearchParams;
}) {
  const sectionActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const [open, setOpen] = useState(sectionActive && !!item.children);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`${navLinkClass} flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-[7px] text-[13px] transition ${
            sectionActive
              ? "bg-[#1c1c1c] text-white"
              : "text-[#b3b3b3] hover:bg-[#141414] hover:text-white"
          }`}
        >
          <Icon className="shrink-0 opacity-90" />
          <span className="flex-1 text-left">{item.label}</span>
          <IconChevron
            className={`opacity-50 transition ${open ? "rotate-90" : ""}`}
          />
        </button>
        {open && (
          <div className="mt-1 ml-2 space-y-0.5 rounded-[8px] bg-[#141414] p-1.5">
            {item.children.map((child) => {
              const childActive = isChildActive(child, pathname, searchParams);
              return (
                <Link
                  key={child.label}
                  href={child.href}
                  className={`${navLinkClass} block rounded-[6px] px-2.5 py-1.5 text-[12.5px] ${
                    childActive
                      ? "bg-[#222] text-white"
                      : "text-[#9a9a9a] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${navLinkClass} flex items-center gap-2.5 rounded-[7px] px-2.5 py-[7px] text-[13px] transition ${
        sectionActive
          ? "bg-[#1c1c1c] text-white"
          : "text-[#b3b3b3] hover:bg-[#141414] hover:text-white"
      }`}
    >
      <Icon className="shrink-0 opacity-90" />
      <span>{item.label}</span>
    </Link>
  );
}

function SideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      <div className="space-y-0.5">
        {mainNav.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            pathname={pathname}
            searchParams={searchParams}
          />
        ))}
      </div>

      <div>
        <p className="mb-1.5 px-2.5 text-[11px] font-medium tracking-[0.04em] text-[#666] uppercase">
          Channels
        </p>
        <div className="space-y-0.5">
          {channelNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              pathname={pathname}
              searchParams={searchParams}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 px-2.5 text-[11px] font-medium tracking-[0.04em] text-[#666] uppercase">
          Admin
        </p>
        <div className="space-y-0.5">
          {adminNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              pathname={pathname}
              searchParams={searchParams}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function AdminShell({
  children,
  stores,
  activeStoreId,
  activeStoreName,
  userEmail,
  userName,
}: {
  children: React.ReactNode;
  stores: { id: string; name: string }[];
  activeStoreId?: string;
  activeStoreName?: string;
  userEmail?: string | null;
  userName?: string | null;
}) {
  const storeLabel = activeStoreName || stores[0]?.name || "mosmo";

  return (
    <div className="admin-root flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-[#1a1a1a] bg-[#0a0a0a] md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#1a2332] text-[12px] font-semibold text-[#7eb6ff]">
            M
          </div>
          <div className="min-w-0">
            <select
              value={activeStoreId}
              onChange={(e) => {
                document.cookie = `activeStoreId=${e.target.value};path=/;max-age=31536000`;
                window.location.reload();
              }}
              className="w-full max-w-[150px] truncate border-0 bg-transparent p-0 text-[13.5px] font-medium text-white outline-none"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="bg-black">
                  {s.name}
                </option>
              ))}
              {stores.length === 0 && <option value="">mosmo</option>}
            </select>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          <Suspense fallback={null}>
            <SideNav />
          </Suspense>
        </nav>

        <div className="border-t border-[#1a1a1a] p-3">
          <div className="flex items-center gap-2.5 rounded-[8px] px-2 py-2 hover:bg-[#141414]">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1f1f1f] text-[11px] font-semibold text-[#9ec1ff]">
              {(storeLabel[0] || "M").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white">
                {userName || storeLabel}
              </p>
              <p className="truncate text-[11px] text-[#777]">{userEmail}</p>
            </div>
            <button
              type="button"
              title="Account"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md p-1 text-[#777] outline-none hover:bg-[#222] hover:text-white"
            >
              <IconMore />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-black">
        <header className="flex items-center justify-between border-b border-[#151515] px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#1a2332] text-[12px] font-semibold text-[#7eb6ff]">
              M
            </div>
            <span className="text-sm font-medium">{storeLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="admin-btn admin-btn-ghost"
          >
            Sign out
          </button>
        </header>

        <main className="flex-1 px-5 py-7 md:px-10 md:py-9">{children}</main>
      </div>

      <a
        href="mailto:support@mosmo.store"
        className="admin-chat"
        aria-label="Support"
      >
        <IconChat />
      </a>
    </div>
  );
}
