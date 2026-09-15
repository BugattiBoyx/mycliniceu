"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MjProductImage, useMjProduct } from "@/components/mj/Catalog";
import { getDosage, mjPrice, type MjProductKey } from "@/lib/mj/data";
import { useMjStore } from "@/lib/mj/store";
import {
  DosageSelector,
  PriceDisplay,
  QuantitySelector,
  TrustBadge,
  WishlistButton,
} from "./ui";
import { ProductPageSections } from "./ProductPageSections";

const SERVICE_LINES: { label: string; icon: React.ReactNode }[] = [
  {
    label: "Snelle levering",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
        <rect x="1" y="7" width="13" height="9" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="5.5" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    ),
  },
  {
    label: "100% originele producten",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
        <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Veilige betaling",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
        <rect x="4" y="10" width="16" height="10" rx="1" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
  {
    label: "Klantenservice via WhatsApp",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </svg>
    ),
  },
  {
    label: "Discrete levering",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
];

export function ProductDetail({ productKey }: { productKey: MjProductKey }) {
  const product = useMjProduct(productKey);
  const { addToCart, toggleWishlist, isWishlisted } = useMjStore();
  const [mg, setMg] = useState(product.defaultMg);
  const [qty, setQty] = useState(1);
  const [flash, setFlash] = useState(false);
  const [added, setAdded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const flashT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addedT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gallery = [
    product.image,
    ...product.gallery.filter((u) => u !== product.image),
  ];
  const dosage = getDosage(product, mg);

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);


  // Mobile sticky purchase bar: always visible on phones; desktop shows after scroll.
  useEffect(() => {
    const mq = window.matchMedia("(max-width:860px)");
    const emit = (visible: boolean) => {
      window.dispatchEvent(
        new CustomEvent("mj-sticky-bar", { detail: { visible } }),
      );
    };

    if (mq.matches) {
      setStickyVisible(true);
      emit(true);
      const onMq = (e: MediaQueryListEvent) => {
        setStickyVisible(e.matches);
        emit(e.matches);
      };
      mq.addEventListener("change", onMq);
      return () => {
        mq.removeEventListener("change", onMq);
        emit(false);
      };
    }

    let visible = false;
    const check = () => {
      const el = purchaseRef.current;
      if (!el) return;
      const shouldShow = el.getBoundingClientRect().bottom < 0;
      if (shouldShow !== visible) {
        visible = shouldShow;
        setStickyVisible(shouldShow);
        emit(shouldShow);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (visible) emit(false);
    };
  }, []);

  const onSelectMg = (next: string) => {
    setMg(next);
    setFlash(true);
    if (flashT.current) clearTimeout(flashT.current);
    flashT.current = setTimeout(() => setFlash(false), 240);
  };

  const onAdd = () => {
    addToCart(productKey, mg, qty);
    setAdded(true);
    if (addedT.current) clearTimeout(addedT.current);
    addedT.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <section
        style={{
          padding: "32px var(--gutter) 0",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
        }}
      >
        <Link href="/winkel" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          ← Terug naar winkel
        </Link>
      </section>

      <section
        className="mj-pdp-grid"
        style={{
          padding: "24px var(--gutter) var(--section-pad-y)",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
        }}
      >
        <div className="mj-pdp-media">
          <div className={`mj-pdp-imgbox mj-product-stage${productKey === "ozempic" ? " mj-product-stage-oz" : ""}`}>
            <MjProductImage
              src={activeImage}
              alt={product.cardTitle}
              width={640}
              height={480}
              priority
              style={{ width: "100%", maxHeight: 480, objectFit: "contain", height: "auto" }}
            />
          </div>
          {gallery.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                gap: 10,
                marginTop: 12,
              }}
            >
              {gallery.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  style={{
                    border:
                      activeImage === url
                        ? "2px solid var(--color-primary)"
                        : "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: 6,
                    background: "var(--white)",
                    cursor: "pointer",
                    aspectRatio: "1",
                    overflow: "hidden",
                  }}
                >
                  <MjProductImage
                    src={url}
                    alt=""
                    width={80}
                    height={80}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mj-pdp-details">
          <div className="mj-eyebrow" style={{ marginBottom: 10 }}>
            {product.name}
          </div>
          <h1 className="mj-serif" style={{ fontSize: "var(--fs-h1)", color: "var(--color-text)", margin: "0 0 8px" }}>
            {product.pageTitle}
          </h1>
          <div style={{ fontSize: 15, color: "var(--color-text-muted)", marginBottom: 22 }}>
            {product.name} · {dosage.mgLabel} mg
          </div>
          <p
            style={{
              fontSize: "var(--fs-body-lg)",
              lineHeight: "var(--lh-body)",
              color: "var(--color-text-soft)",
              maxWidth: 460,
              margin: "0 0 20px",
            }}
          >
            {product.description}
          </p>
          <ul className="mj-check-inline" style={{ margin: "0 0 32px" }}>
            {product.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="mj-buybox">
            <DosageSelector options={product.dosages} value={mg} onChange={onSelectMg} />
            <div
              className="mj-buybox-price"
              style={{ opacity: flash ? 0.3 : 1 }}
            >
              <PriceDisplay now={dosage.now} was={dosage.was} size="lg" />
            </div>
            <div ref={purchaseRef} className="mj-buybox-actions">
              <QuantitySelector value={qty} onChange={setQty} />
              <button
                type="button"
                className="mj-btn mj-btn-primary mj-btn-lg"
                style={{ flex: 1 }}
                onClick={onAdd}
              >
                {added ? "Toegevoegd ✓" : "Toevoegen aan winkelwagen"}
              </button>
            </div>
            <WishlistButton
              active={isWishlisted(productKey)}
              onClick={() => toggleWishlist(productKey)}
            />
          </div>
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <TrustBadge label="Voorgeschreven door BIG-geregistreerde Nederlandse artsen" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
              {SERVICE_LINES.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {s.icon}
                  <span style={{ fontSize: 13, color: "var(--color-text-soft)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProductPageSections productKey={productKey} />

      {/* Mobile sticky purchase bar */}
      {stickyVisible && (
        <div className="mj-pdp-mobile-bar">
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {product.name} · {dosage.mgLabel} mg
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text)" }}>
              {mjPrice(dosage.now)}
            </div>
          </div>
          <button type="button" className="mj-btn mj-btn-primary mj-pdp-mobile-cta" onClick={onAdd}>
            {added ? "Toegevoegd ✓" : "In winkelwagen"}
          </button>
        </div>
      )}
    </div>
  );
}
