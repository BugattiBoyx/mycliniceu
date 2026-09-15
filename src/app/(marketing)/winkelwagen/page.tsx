import type { Metadata } from "next";
import { CartPageClient } from "@/components/mj/CartPageClient";

export const metadata: Metadata = {
  title: "Winkelwagen",
};

export default function WinkelwagenPage() {
  return <CartPageClient />;
}
