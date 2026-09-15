import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DomainForm, RemoveDomainButton } from "./DomainForm";

export default async function DomainsPage() {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) return <p className="text-[#8b8b8b]">No store selected</p>;

  const domains = await prisma.domain.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  const selfHosted =
    process.env.DOMAIN_PROVIDER === "selfhost" ||
    (!process.env.VERCEL_STOREFRONT_PROJECT_ID &&
      process.env.DOMAIN_PROVIDER !== "vercel");
  const aRecord = selfHosted
    ? process.env.STOREFRONT_IP || "<storefront-server-ip>"
    : "76.76.21.21";
  const cnameRecord = selfHosted
    ? process.env.STOREFRONT_CNAME || root.replace(":3000", "")
    : "cname.vercel-dns.com";

  return (
    <div className="mx-auto max-w-[1080px]">
      <h1 className="text-[28px] font-semibold tracking-tight">Domains</h1>
      <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
        Default:{" "}
        <span className="text-[#93c5fd]">
          {store.subdomain}.{root.replace(":3000", "")}
        </span>{" "}
        · path preview{" "}
        <span className="text-[#93c5fd]">/store/{store.subdomain}</span>
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="admin-card p-5">
          <DomainForm storeId={store.id} />
        </div>
        <div className="admin-card p-5">
          <p className="text-[14px] font-medium">DNS instructions</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] text-[#8b8b8b]">
            <li>
              Root domains: add an <span className="text-[#93c5fd]">A</span>{" "}
              record pointing to{" "}
              <span className="font-mono text-[#93c5fd]">{aRecord}</span>
            </li>
            <li>
              Subdomains: add a <span className="text-[#93c5fd]">CNAME</span>{" "}
              record pointing to{" "}
              <span className="font-mono text-[#93c5fd]">{cnameRecord}</span>
            </li>
            <li>SSL is issued automatically once DNS propagates</li>
          </ol>
          <div className="mt-6 space-y-2">
            {domains.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-[8px] bg-[#0a0a0a] px-3 py-2.5 text-[13px]"
              >
                <span>{d.hostname}</span>
                <span className="flex items-center gap-3">
                  <span className={d.verified ? "text-[#93c5fd]" : "text-[#f59e0b]"}>
                    {d.verified ? "connected" : "pending"}
                  </span>
                  <RemoveDomainButton domainId={d.id} />
                </span>
              </div>
            ))}
            {domains.length === 0 && (
              <p className="text-[13px] text-[#8b8b8b]">
                No custom domains yet — the store runs on its default
                subdomain. If a domain ever gets banned, connect a new one
                here and the store keeps running with all data intact.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
