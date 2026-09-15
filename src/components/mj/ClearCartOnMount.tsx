"use client";

import { useEffect, useRef } from "react";
import { useMjStore } from "@/lib/mj/store";

// Clears the local cart + discount after a successful order. Waits for the
// store to hydrate from localStorage first, otherwise hydration would restore
// the cart right after we cleared it.
export function ClearCartOnMount() {
  const { hydrated, clearCart } = useMjStore();
  const done = useRef(false);
  useEffect(() => {
    if (!hydrated || done.current) return;
    done.current = true;
    clearCart();
  }, [hydrated, clearCart]);
  return null;
}
