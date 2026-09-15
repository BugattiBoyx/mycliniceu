import Link from "next/link";
import { IconHelp } from "@/components/admin/icons";
import { getActiveStore } from "@/lib/active-store";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function CustomersPage() {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) return <p className="text-[#8b8b8b]">No store selected</p>;

  const customers = await prisma.customer.findMany({
    where: { storeId: store.id },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1080px]">
      <h1 className="text-[28px] font-semibold tracking-tight">Customers</h1>

      {customers.length === 0 ? (
        <>
          <section className="admin-card admin-empty mt-8">
            <h2 className="text-[18px] font-medium">Build your customer base</h2>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#8b8b8b]">
              Customers appear here automatically when they complete checkout on
              your storefront.
            </p>
          </section>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#8b8b8b]">
              <IconHelp />
              Learn more about customers
            </span>
          </div>
        </>
      ) : (
        <div className="admin-card mt-8 overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#161616]">
                  <td>
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="font-medium text-white hover:text-[#93c5fd]"
                    >
                      {c.name || "—"}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-[#a3a3a3] hover:text-white"
                    >
                      {c.email}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/admin/customers/${c.id}`}>{c._count.orders}</Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-[#6a6a6a] hover:text-white"
                    >
                      {c.createdAt.toLocaleDateString("nl-NL")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
