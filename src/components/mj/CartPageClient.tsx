"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MjProductImage, useMjCatalog } from "@/components/mj/Catalog";
import { mjPrice } from "@/lib/mj/data";
import { itemPrice, useMjStore } from "@/lib/mj/store";
import { EmptyState, QuantitySelector } from "./ui";

export function CartPageClient() {
  const router = useRouter();
  const catalog = useMjCatalog();
  const {
    items,
    hydrated,
    updateQty,
    discount,
    discountAmount,
    applyDiscountCode,
    removeDiscount,
    subtotal,
    total,
  } = useMjStore();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [discountError, setDiscountError] = useState(false);

  const hasItems = items.length > 0;

  const applyDiscount = () => {
    if (applyDiscountCode(discountInput)) {
      setDiscountOpen(false);
      setDiscountInput("");
      setDiscountError(false);
    } else {
      setDiscountError(true);
    }
  };

  return (
    <section
      style={{
        padding: "64px var(--gutter) var(--section-pad-y)",
        maxWidth: "var(--content-max-editorial)",
        margin: "0 auto",
        minHeight: "50vh",
      }}
    >
      <h1
        className="mj-serif"
        style={{ fontSize: "var(--fs-h1)", color: "var(--color-text)", margin: "0 0 40px" }}
      >
        Winkelwagen
      </h1>

      {hasItems ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 40 }}>
            {items.map((item, i) => {
              const p = catalog[item.product];
              const mgLabel = item.mg.replace(".", ",");
              const price = itemPrice(item);
              return (
                <div
                  key={`${item.product}-${item.mg}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    flexWrap: "wrap",
                    padding: "24px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      background: "var(--white)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 5,
                    }}
                  >
                    <MjProductImage
                      src={p.image}
                      alt={p.name}
                      width={38}
                      height={38}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div className="mj-serif" style={{ fontSize: 18, color: "var(--color-text)" }}>
                      {p.name} · {mgLabel} mg
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
                      {mjPrice(price)} per stuk
                    </div>
                  </div>
                  <QuantitySelector value={item.qty} onChange={(q) => updateQty(i, q)} />
                  <div
                    style={{
                      flexShrink: 0,
                      minWidth: 70,
                      textAlign: "right",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--color-text)",
                    }}
                  >
                    {mjPrice(price * item.qty)}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateQty(i, 0)}
                    aria-label="Verwijderen"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: 340, width: "100%" }}>
              <div style={{ marginBottom: 20 }}>
                {discount ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--color-bg-alt)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 14px",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--color-primary)" }}>
                      {discount.code} toegepast — {discount.percent}% korting
                    </span>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-muted)",
                        fontSize: 12,
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Verwijderen
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDiscountOpen((v) => !v)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-primary)",
                        fontSize: 13,
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Kortingscode toevoegen
                    </button>
                    {discountOpen && (
                      <>
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <input
                            value={discountInput}
                            onChange={(e) => setDiscountInput(e.target.value)}
                            placeholder="Voer kortingscode in"
                            style={{
                              flex: 1,
                              minWidth: 0,
                              border: "1px solid var(--color-border)",
                              borderRadius: "var(--radius-sm)",
                              padding: "9px 12px",
                              fontFamily: "var(--font-sans)",
                              fontSize: 13,
                              outline: "none",
                              background: "var(--white)",
                            }}
                          />
                          <button
                            type="button"
                            className="mj-btn mj-btn-secondary mj-btn-sm"
                            onClick={applyDiscount}
                          >
                            Toepassen
                          </button>
                        </div>
                        {discountError && (
                          <div style={{ fontSize: 12, color: "var(--mj-error)", marginTop: 8 }}>
                            Deze kortingscode is niet geldig.
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--color-text-soft)", marginBottom: 8 }}>
                <span>Subtotaal</span>
                <span>{mjPrice(subtotal)}</span>
              </div>
              {discount && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--sage)", fontWeight: 600, marginBottom: 8 }}>
                  <span>Korting ({discount.code})</span>
                  <span>-{mjPrice(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--color-text-soft)", marginBottom: 16 }}>
                <span>Verzending</span>
                <span>Gratis</span>
              </div>
              <div
                className="mj-serif"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 22,
                  color: "var(--color-text)",
                  paddingTop: 16,
                  borderTop: "1px solid var(--color-border)",
                  marginBottom: 24,
                }}
              >
                <span>Totaal</span>
                <span>{mjPrice(total)}</span>
              </div>
              <button
                type="button"
                className="mj-btn mj-btn-checkout mj-btn-lg"
                style={{ width: "100%" }}
                onClick={() => router.push("/afrekenen")}
              >
                Naar afrekenen
              </button>
            </div>
          </div>
        </>
      ) : hydrated ? (
        <>
          <EmptyState
            title="Je winkelwagen is leeg"
            description="Bekijk onze behandelingen en voeg een product toe."
          />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button
              type="button"
              className="mj-btn mj-btn-primary mj-btn-lg"
              onClick={() => router.push("/winkel")}
            >
              Bekijk behandelingen
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
