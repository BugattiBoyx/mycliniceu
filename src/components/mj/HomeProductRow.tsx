"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MjProductImage, useMjProduct } from "@/components/mj/Catalog";
import { getDosage, type MjProductKey } from "@/lib/mj/data";
import { useMjStore } from "@/lib/mj/store";
import { DosageSelector, PriceDisplay, WishlistButton } from "./ui";

export function HomeProductRow({ productKey }: { productKey: MjProductKey }) {
  const product = useMjProduct(productKey);
  const { addToCart, toggleWishlist, isWishlisted } = useMjStore();
  const [mg, setMg] = useState(product.defaultMg);
  const [flash, setFlash] = useState(false);
  const [added, setAdded] = useState(false);
  const flashT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addedT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dosage = getDosage(product, mg);

  const onSelectMg = (next: string) => {
    setMg(next);
    setFlash(true);
    if (flashT.current) clearTimeout(flashT.current);
    flashT.current = setTimeout(() => setFlash(false), 240);
  };

  const onAdd = () => {
    addToCart(productKey, mg, 1);
    setAdded(true);
    if (addedT.current) clearTimeout(addedT.current);
    addedT.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="mj-card-hover"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-image)",
        overflow: "hidden",
      }}
    >
      <div className="mj-product-row">
        <div
          className={`mj-product-img mj-product-stage${productKey === "ozempic" ? " mj-product-stage-oz" : ""}`}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(24px, 4vw, 40px)",
            minHeight: 300,
          }}
        >
          <span className="mj-pcard-flag">
            {productKey === "mounjaro" ? "Meest gekozen" : "Klinisch bewezen"}
          </span>
          <MjProductImage
            src={product.image}
            alt={product.cardTitle}
            width={640}
            height={440}
            style={{
              width: "100%",
              height: "100%",
              maxHeight: 360,
              objectFit: "contain",
            }}
          />
        </div>
        <div className="mj-product-copy">
          <div className="mj-eyebrow" style={{ marginBottom: 8 }}>
            {product.name} · {dosage.mgLabel} mg
          </div>
          <div className="mj-serif" style={{ fontSize: 26, color: "var(--color-text)", marginBottom: 12 }}>
            {product.cardTitle}
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--color-text-soft)",
              maxWidth: 420,
              margin: "0 0 22px",
            }}
          >
            {product.description}
          </p>
          <div className="mj-buybox" style={{ maxWidth: "100%" }}>
            <DosageSelector options={product.dosages} value={mg} onChange={onSelectMg} />
            <div
              className="mj-buybox-price"
              style={{
                transition: "opacity 220ms var(--ease-standard)",
                opacity: flash ? 0.3 : 1,
              }}
            >
              <PriceDisplay now={dosage.now} was={dosage.was} size="lg" />
            </div>
            <div className="mj-buybox-actions" style={{ marginBottom: 0 }}>
              <button type="button" className="mj-btn mj-btn-primary mj-btn-lg" onClick={onAdd}>
                {added ? "Toegevoegd ✓" : "Toevoegen aan winkelwagen"}
              </button>
            </div>
            <WishlistButton
              active={isWishlisted(productKey)}
              onClick={() => toggleWishlist(productKey)}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <Link
              href={`/winkel/${productKey}`}
              style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}
            >
              Volledige productinformatie →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
