"use client";

// The Clinic storefront state: cart, wishlist, discount, mini-cart drawer.
// Persisted in localStorage (mj_* keys per design handoff); orders are placed
// against the real platform API at checkout.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MJ_PRODUCTS, getDosage, type MjProductKey } from "./data";

export type MjCartItem = {
  product: MjProductKey;
  mg: string;
  qty: number;
};

export type MjDiscount = { code: string; percent: number } | null;

const CART_KEY = "mj_cart_v1";
const WISH_KEY = "mj_wishlist_v1";
const DISCOUNT_KEY = "mj_discount_v1";

const VALID_CODES: Record<string, { code: string; percent: number }> = {
  WELCOME10: { code: "WELCOME10", percent: 10 },
};

export function itemPrice(item: MjCartItem) {
  return getDosage(MJ_PRODUCTS[item.product], item.mg).now;
}

type MjStoreValue = {
  items: MjCartItem[];
  wishlist: MjProductKey[];
  discount: MjDiscount;
  drawerOpen: boolean;
  hydrated: boolean;
  addToCart: (product: MjProductKey, mg: string, qty?: number) => void;
  updateQty: (index: number, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (key: MjProductKey) => void;
  isWishlisted: (key: MjProductKey) => boolean;
  applyDiscountCode: (input: string) => boolean;
  removeDiscount: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  count: number;
  subtotal: number;
  discountAmount: number;
  total: number;
};

const MjStoreContext = createContext<MjStoreValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function MjStoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MjCartItem[]>([]);
  const [wishlist, setWishlist] = useState<MjProductKey[]>([]);
  const [discount, setDiscount] = useState<MjDiscount>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(
      readJson<MjCartItem[]>(CART_KEY, []).filter(
        (i) => i && MJ_PRODUCTS[i.product] && i.qty > 0,
      ),
    );
    setWishlist(readJson<MjProductKey[]>(WISH_KEY, []));
    setDiscount(readJson<MjDiscount>(DISCOUNT_KEY, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (discount) localStorage.setItem(DISCOUNT_KEY, JSON.stringify(discount));
    else localStorage.removeItem(DISCOUNT_KEY);
  }, [discount, hydrated]);

  const addToCart = useCallback(
    (product: MjProductKey, mg: string, qty = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.product === product && i.mg === mg,
        );
        if (idx >= 0) {
          return prev.map((i, n) =>
            n === idx ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [...prev, { product, mg, qty }];
      });
      setDrawerOpen(true);
    },
    [],
  );

  const updateQty = useCallback((index: number, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((_, n) => n !== index);
      return prev.map((i, n) => (n === index ? { ...i, qty } : i));
    });
  }, []);

  const value = useMemo<MjStoreValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + itemPrice(i) * i.qty, 0);
    const discountAmount = discount
      ? subtotal * (discount.percent / 100)
      : 0;
    return {
      items,
      wishlist,
      discount,
      drawerOpen,
      hydrated,
      addToCart,
      updateQty,
      clearCart: () => {
        setItems([]);
        setDiscount(null);
      },
      toggleWishlist: (key) =>
        setWishlist((prev) =>
          prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        ),
      isWishlisted: (key) => wishlist.includes(key),
      applyDiscountCode: (input) => {
        const code = String(input || "").trim().toUpperCase();
        if (!VALID_CODES[code]) return false;
        setDiscount(VALID_CODES[code]);
        return true;
      },
      removeDiscount: () => setDiscount(null),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      count,
      subtotal,
      discountAmount,
      total: Math.max(0, subtotal - discountAmount),
    };
  }, [items, wishlist, discount, drawerOpen, hydrated, addToCart, updateQty]);

  return (
    <MjStoreContext.Provider value={value}>{children}</MjStoreContext.Provider>
  );
}

export function useMjStore() {
  const ctx = useContext(MjStoreContext);
  if (!ctx) throw new Error("useMjStore must be used within MjStoreProvider");
  return ctx;
}
