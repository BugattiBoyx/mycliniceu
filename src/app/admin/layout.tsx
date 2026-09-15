import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AdminShell } from "@/components/admin/AdminShell";
import { SessionProvider } from "@/components/admin/SessionProvider";
import { getActiveStore } from "@/lib/active-store";
import { requireUser } from "@/lib/session";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "The Clinic — Admin",
    template: "%s — The Clinic Admin",
  },
  description: "The Clinic merchant dashboard",
  icons: { icon: "/brand/favicon.png" },
};

const adminFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-admin",
  weight: ["400", "500", "600", "700"],
});

// Admin always shows live data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const { stores, store } = await getActiveStore(user.id);

  return (
    <SessionProvider>
      <div className={adminFont.variable}>
        <AdminShell
          stores={stores.map((s) => ({ id: s.id, name: s.name }))}
          activeStoreId={store?.id}
          activeStoreName={store?.name}
          userEmail={user.email}
          userName={user.name}
        >
          {children}
        </AdminShell>
      </div>
    </SessionProvider>
  );
}
