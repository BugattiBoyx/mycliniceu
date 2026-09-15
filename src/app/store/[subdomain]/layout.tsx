import Link from "next/link";
import { requireLiveStore, storeBasePath } from "@/lib/storefront";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const store = await requireLiveStore(subdomain);
  const base = storeBasePath(subdomain);
  const brand = store.brandColor || "#004751";

  return (
    <div
      className="min-h-screen bg-[#f6f8f8] text-[#0f1c1e]"
      style={{ ["--brand" as string]: brand }}
    >
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href={base} className="font-display text-xl font-semibold" style={{ color: brand }}>
            {store.name}
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href={`${base}/shop`} className="hover:opacity-70">
              Shop
            </Link>
            <Link href={`${base}/cart`} className="hover:opacity-70">
              Cart
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-black/50 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {store.name}</p>
          <p>{store.contactEmail || store.tagline}</p>
        </div>
      </footer>
    </div>
  );
}
