"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "./CartDrawer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
