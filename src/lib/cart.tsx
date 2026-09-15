"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product, ProductVariant } from "./products";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  variantId: string;
  variantLabel: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
  ) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "moun-journey-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return {
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, variant, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((i) => i.variantId === variant.id);
          if (existing) {
            return prev.map((i) =>
              i.variantId === variant.id
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            );
          }
          return [
            ...prev,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              variantId: variant.id,
              variantLabel: variant.label,
              price: variant.price,
              image: variant.image,
              quantity,
            },
          ];
        });
        setIsOpen(true);
      },
      removeItem: (variantId) =>
        setItems((prev) => prev.filter((i) => i.variantId !== variantId)),
      setQuantity: (variantId, quantity) =>
        setItems((prev) =>
          prev
            .map((i) =>
              i.variantId === variantId ? { ...i, quantity } : i,
            )
            .filter((i) => i.quantity > 0),
        ),
      clear: () => setItems([]),
      count,
      subtotal,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
