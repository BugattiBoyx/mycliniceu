"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/products";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    setQuantity,
    subtotal,
    count,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className="fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="font-display text-xl font-semibold text-ink">
              Winkelwagen
            </p>
            <p className="text-sm text-ink-soft">{count} artikel(en)</p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="rounded-3xl bg-mist px-5 py-10 text-center">
              <p className="font-display text-lg font-semibold text-ink">
                Uw winkelwagen is leeg
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Ontdek Ozempic en start uw bestelling.
              </p>
              <Link
                href="/winkel"
                onClick={closeCart}
                className="btn-primary mt-5"
              >
                Naar de winkel
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-3 rounded-2xl border border-line p-3"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-mist">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.name}
                  </p>
                  <p className="text-xs text-ink-soft">{item.variantLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-brand">
                    {formatEuro(item.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-full bg-mist"
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-full bg-mist"
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-xs text-ink-soft underline"
                      onClick={() => removeItem(item.variantId)}
                    >
                      Verwijder
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-ink-soft">Subtotaal</span>
              <span className="font-display text-xl font-semibold text-ink">
                {formatEuro(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full"
            >
              Afrekenen
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="mt-3 block text-center text-sm font-medium text-ink-soft underline"
            >
              Bekijk winkelwagen
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
