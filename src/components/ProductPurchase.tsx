"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { formatEuro } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-mist">
          <Image
            src={product.images[activeImage] ?? product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-8"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-20 w-20 overflow-hidden rounded-2xl border bg-mist ${
                  activeImage === i ? "border-brand" : "border-line"
                }`}
              >
                <Image src={src} alt="" fill className="object-contain p-2" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="eyebrow">{product.category}</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink md:text-5xl">
          {product.name}
        </h1>
        {product.rating && (
          <p className="mt-3 text-sm text-ink-soft">
            {"★".repeat(Math.round(product.rating))} {product.rating.toFixed(2)}
            {product.reviewCount ? ` (${product.reviewCount} review)` : ""}
          </p>
        )}
        <p className="mt-4 text-lg text-ink-soft">{product.description}</p>
        <ul className="mt-5 space-y-2">
          {product.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-ink">
              <span className="text-brand">✓</span>
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-end gap-3">
          <p className="font-display text-4xl font-semibold text-ink">
            {formatEuro(variant.price)}
          </p>
          <p className="pb-1 text-sm text-ink-soft">op voorraad</p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-ink">Kies dosering (MG)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {product.variants.map((v) => {
              const selected = v.id === variant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-white hover:border-brand/40"
                  }`}
                >
                  <span className="block text-sm font-bold text-ink">{v.label}</span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    {formatEuro(v.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-line bg-white">
            <button
              type="button"
              className="grid h-12 w-12 place-items-center"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button
              type="button"
              className="grid h-12 w-12 place-items-center"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => addItem(product, variant, qty)}
          >
            Toevoegen aan winkelwagen
          </button>
        </div>

        <p className="mt-6 rounded-2xl bg-sand px-4 py-3 text-sm text-ink-soft">
          Alleen op recept. Gebruik uitsluitend onder medisch toezicht van een
          Nederlandse arts.
        </p>
      </div>
    </div>
  );
}
