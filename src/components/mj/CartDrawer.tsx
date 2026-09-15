"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { MjProductImage, useMjCatalog } from "@/components/mj/Catalog";
import { mjPrice } from "@/lib/mj/data";
import { itemPrice, useMjStore } from "@/lib/mj/store";
import { EmptyState, QuantitySelector } from "./ui";

export function MjCartDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const catalog = useMjCatalog();
  const { items, drawerOpen, closeDrawer, updateQty, subtotal } = useMjStore();
  const hasItems = items.length > 0;

  // Close the drawer whenever the route changes (e.g. "Bekijk winkelwagen")
  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(36,33,30,.4)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 280ms var(--ease-standard)",
          zIndex: 90,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          maxWidth: "92vw",
          background: "var(--color-bg)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 91,
          display: "flex",
          flexDirection: "column",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 320ms var(--ease-emphasized)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
          }}
        >
          <div className="mj-serif" style={{ fontSize: 19, color: "var(--color-text)" }}>
            Winkelwagen
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Sluiten"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              padding: 4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px 24px" }}>
          {hasItems ? (
            items.map((item, i) => {
              const p = catalog[item.product];
              const mgLabel = item.mg.replace(".", ",");
              return (
                <div
                  key={`${item.product}-${item.mg}`}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "18px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      background: "var(--white)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 6,
                      position: "relative",
                    }}
                  >
                    <MjProductImage
                      src={p.image}
                      alt={p.name}
                      width={52}
                      height={52}
                      style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                      {mgLabel} mg
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 10,
                        gap: 10,
                      }}
                    >
                      <QuantitySelector compact value={item.qty} onChange={(q) => updateQty(i, q)} />
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", whiteSpace: "nowrap" }}>
                        {mjPrice(itemPrice(item) * item.qty)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateQty(i, 0)}
                    aria-label="Verwijderen"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-faint)",
                      display: "flex",
                      height: "fit-content",
                      padding: 2,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "40px 0" }}>
              <EmptyState
                title="Je winkelwagen is leeg"
                description="Bekijk onze behandelingen en voeg een product toe."
              />
            </div>
          )}
        </div>

        {hasItems && (
          <div
            style={{
              padding: "18px 24px",
              borderTop: "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                color: "var(--color-text)",
                marginBottom: 16,
              }}
            >
              <span>Subtotaal</span>
              <span style={{ fontWeight: 600 }}>{mjPrice(subtotal)}</span>
            </div>
            <button
              type="button"
              className="mj-btn mj-btn-checkout mj-btn-lg"
              style={{ width: "100%" }}
              onClick={() => {
                closeDrawer();
                router.push("/afrekenen");
              }}
            >
              Naar afrekenen
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 14,
              }}
            >
              <button
                type="button"
                onClick={closeDrawer}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--color-primary)",
                  padding: 0,
                }}
              >
                Verder winkelen
              </button>
              <span style={{ color: "var(--color-border)" }}>·</span>
              <Link
                href="/winkelwagen"
                onClick={closeDrawer}
                style={{ fontSize: 13, color: "var(--color-primary)" }}
              >
                Naar winkelwagen
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
