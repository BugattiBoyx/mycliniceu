import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { MjCartDrawer } from "@/components/mj/CartDrawer";
import { MjCatalogProvider } from "@/components/mj/Catalog";
import { MjFooter } from "@/components/mj/Footer";
import { MjHeader } from "@/components/mj/Header";
import { ScrollProgress } from "@/components/mj/Motion";
import { MjWhatsAppButton } from "@/components/mj/WhatsAppButton";
import { getMjCatalog } from "@/lib/mj/catalog";
import { mjRootMetadata } from "@/lib/mj/metadata";
import { MjStoreProvider } from "@/lib/mj/store";
import "./mj.css";

export const dynamic = "force-dynamic";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = mjRootMetadata;

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const catalog = await getMjCatalog();

  return (
    <div className={`${sans.variable} ${display.variable} mj-root`}>
      <MjCatalogProvider catalog={catalog}>
        <MjStoreProvider>
          <ScrollProgress />
          <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
            <MjHeader />
            <main style={{ flex: 1 }}>{children}</main>
            <MjFooter />
          </div>
          <MjWhatsAppButton />
          <MjCartDrawer />
        </MjStoreProvider>
      </MjCatalogProvider>
    </div>
  );
}
