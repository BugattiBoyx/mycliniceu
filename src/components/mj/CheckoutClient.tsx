"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { MjProductImage, useMjCatalog } from "@/components/mj/Catalog";
import { MJ_BRAND_NAME, MJ_COMPANY_NAME } from "@/lib/mj/brand";
import { MJ_PRODUCTS, mjPrice } from "@/lib/mj/data";
import { itemPrice, useMjStore } from "@/lib/mj/store";
import { EmptyState } from "./ui";

export type CheckoutMethod = {
  type: string; // platform payment method type: demo | high_risk | crypto | bank_transfer
  config: Record<string, string>;
};

// Design order for the payment accordion
const METHOD_ORDER = ["demo", "high_risk", "crypto", "bank_transfer"];

const CTA_LABELS: Record<string, string> = {
  demo: "Test betaling plaatsen",
  high_risk: "Veilig betalen",
  crypto: "Crypto betaling starten",
  bank_transfer: "Bestelling plaatsen",
};

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    color: "var(--color-text)",
    outline: "none",
    background: "var(--white)",
  };
}

function RadioDot({ active }: { active: boolean }) {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: "1.5px solid var(--color-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "var(--color-primary)",
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}

function MethodRow({
  active,
  onSelect,
  left,
  right,
  panel,
}: {
  active: boolean;
  onSelect: () => void;
  left: ReactNode;
  right?: ReactNode;
  panel: ReactNode;
}) {
  return (
    <div>
      <div
        onClick={onSelect}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 18px",
          cursor: "pointer",
          flexWrap: "wrap",
          rowGap: 8,
          border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
          background: active ? "var(--color-bg-alt)" : "var(--white)",
          borderRadius: active
            ? "var(--radius-sm) var(--radius-sm) 0 0"
            : "var(--radius-sm)",
          transition:
            "border-color 200ms var(--ease-standard), background 200ms var(--ease-standard)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <RadioDot active={active} />
          {left}
        </div>
        {right}
      </div>
      <div
        style={{
          maxHeight: active ? 720 : 0,
          opacity: active ? 1 : 0,
          overflow: "hidden",
          background: "var(--color-bg-alt)",
          borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
          transition:
            "max-height 340ms var(--ease-standard), opacity 240ms var(--ease-standard)",
        }}
      >
        <div style={{ padding: 20 }}>{panel}</div>
      </div>
    </div>
  );
}

function LockNote({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <rect x="4" y="10" width="16" height="10" rx="1" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
      <span style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
        {children}
      </span>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "var(--color-text-muted)",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function CardBrandBadges() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
      <div
        style={{
          width: 36,
          height: 22,
          border: "1px solid var(--color-border)",
          borderRadius: 3,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia,serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 10,
            color: "#1A1F71",
            letterSpacing: "-.3px",
          }}
        >
          VISA
        </span>
      </div>
      <div
        style={{
          width: 36,
          height: 22,
          border: "1px solid var(--color-border)",
          borderRadius: 3,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: 22, height: 13 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#EB001B",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 9,
              top: 0,
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#F79E1B",
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TestCardFields() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--white)",
      }}
    >
      <CardBrandBadges />
      <div>
        <FieldLabel>Kaartnummer</FieldLabel>
        <input
          name="demoCardNumber"
          defaultValue="4242 4242 4242 4242"
          autoComplete="off"
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          style={inputStyle()}
        />
      </div>
      <div className="mj-co-grid2">
        <div>
          <FieldLabel>Vervaldatum</FieldLabel>
          <input
            name="demoCardExpiry"
            defaultValue="12/28"
            autoComplete="off"
            placeholder="MM/JJ"
            style={inputStyle()}
          />
        </div>
        <div>
          <FieldLabel>CVC</FieldLabel>
          <input
            name="demoCardCvc"
            defaultValue="123"
            autoComplete="off"
            inputMode="numeric"
            placeholder="123"
            style={inputStyle()}
          />
        </div>
      </div>
      <div>
        <FieldLabel>Naam op kaart</FieldLabel>
        <input
          name="demoCardName"
          defaultValue="Test Gebruiker"
          autoComplete="off"
          placeholder="Naam op kaart"
          style={inputStyle()}
        />
      </div>
    </div>
  );
}

export function CheckoutClient({
  storeId,
  methods,
}: {
  storeId: string;
  methods: CheckoutMethod[];
}) {
  const router = useRouter();
  const catalog = useMjCatalog();
  const {
    items,
    hydrated,
    discount,
    discountAmount,
    applyDiscountCode,
    removeDiscount,
    subtotal,
    total,
  } = useMjStore();

  const ordered = useMemo(
    () =>
      [...methods].sort(
        (a, b) => METHOD_ORDER.indexOf(a.type) - METHOD_ORDER.indexOf(b.type),
      ),
    [methods],
  );

  const [selected, setSelected] = useState(() => ordered[0]?.type ?? "");
  const [cryptoCurrency, setCryptoCurrency] = useState("BTC");
  const [copiedIban, setCopiedIban] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [discountError, setDiscountError] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasItems = items.length > 0;
  const bank = ordered.find((m) => m.type === "bank_transfer")?.config ?? {};
  const activeMethod = ordered.find((m) => m.type === selected) ?? ordered[0];
  const ctaLabel = CTA_LABELS[activeMethod?.type ?? ""] || "Bestelling plaatsen";

  const applyDiscount = () => {
    if (applyDiscountCode(discountInput)) {
      setDiscountOpen(false);
      setDiscountInput("");
      setDiscountError(false);
    } else {
      setDiscountError(true);
    }
  };

  const copyIban = () => {
    if (bank.iban) navigator.clipboard?.writeText(bank.iban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 1800);
  };

  async function placeOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasItems || submitting) return;
    if (!activeMethod) {
      setError(
        "Er is nog geen betaalmethode geconfigureerd. Neem contact op met de winkel.",
      );
      return;
    }
    setError("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          email: fd.get("email"),
          phone: fd.get("phone"),
          name: `${String(fd.get("firstName") || "").trim()} ${String(fd.get("lastName") || "").trim()}`.trim(),
          address: fd.get("street"),
          zip: fd.get("postalCode"),
          city: fd.get("city"),
          country: fd.get("country"),
          discountCode: discount?.code || "",
          paymentMethod: activeMethod?.type,
          origin: window.location.origin,
          items: items.map((i) => ({
            productSlug: MJ_PRODUCTS[i.product].slug,
            variantLabel: MJ_PRODUCTS[i.product].dosages.find(
              (d) => d.mg === i.mg,
            )?.variantLabel,
            quantity: i.qty,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Bestelling plaatsen is niet gelukt. Probeer het opnieuw.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setError("Netwerkfout — probeer het opnieuw.");
      setSubmitting(false);
    }
  }

  if (!hasItems) {
    if (!hydrated) return <div style={{ minHeight: "50vh" }} />;
    return (
      <section
        style={{
          padding: "100px var(--gutter)",
          maxWidth: "var(--content-max-editorial)",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <EmptyState
          title="Je winkelwagen is leeg"
          description="Voeg eerst een behandeling toe voordat je afrekent."
        />
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            className="mj-btn mj-btn-primary mj-btn-lg"
            onClick={() => router.push("/winkel")}
          >
            Naar de winkel
          </button>
        </div>
      </section>
    );
  }

  const summaryItems = (
    <>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
        {items.map((item) => {
          const p = catalog[item.product];
          return (
            <div
              key={`${item.product}-${item.mg}`}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
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
                  width={42}
                  height={42}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-text)" }}>
                  {p.name} · {item.mg.replace(".", ",")} mg
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>
                  Aantal: {item.qty}
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-text)", whiteSpace: "nowrap" }}>
                {mjPrice(itemPrice(item) * item.qty)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 16 }}>
        {discount ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--white)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "9px 12px",
            }}
          >
            <span style={{ fontSize: 12.5, color: "var(--pine-800)" }}>
              {discount.code} toegepast
            </span>
            <button
              type="button"
              onClick={removeDiscount}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                fontSize: 11.5,
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
                color: "var(--pine-800)",
                fontSize: 12.5,
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
                    placeholder="Kortingscode"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "8px 10px",
                      fontFamily: "var(--font-sans)",
                      fontSize: 12.5,
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
                  <div style={{ fontSize: 11.5, color: "var(--mj-error)", marginTop: 6 }}>
                    Deze kortingscode is niet geldig.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );

  const summaryTotals = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--color-text-soft)", marginBottom: 8 }}>
        <span>Subtotaal</span>
        <span>{mjPrice(subtotal)}</span>
      </div>
      {discount && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--pine-700)", marginBottom: 8 }}>
          <span>Korting ({discount.code})</span>
          <span>-{mjPrice(discountAmount)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--color-text-soft)", marginBottom: 14 }}>
        <span>Verzending</span>
        <span>Gratis</span>
      </div>
      <div
        className="mj-serif"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          color: "var(--color-text)",
          paddingTop: 14,
          borderTop: "1px solid var(--color-border)",
          marginBottom: 20,
        }}
      >
        <span>Totaal</span>
        <span>{mjPrice(total)}</span>
      </div>
    </>
  );

  const submitButton = (className = "") => (
    <>
      {error && (
        <div
          style={{
            background: "var(--mj-error-light)",
            color: "var(--mj-error)",
            fontSize: 13,
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        className={`mj-btn mj-btn-checkout mj-btn-lg ${className}`.trim()}
        style={{ width: "100%" }}
        disabled={submitting || ordered.length === 0}
      >
        {submitting ? "Even geduld…" : ctaLabel}
      </button>
    </>
  );

  const summaryCheckout = (
    <>
      {summaryTotals}
      <div className="mj-co-submit-desktop">{submitButton()}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          marginTop: 14,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="16" height="10" rx="1" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <span style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
          Veilige, versleutelde betaling
        </span>
      </div>
    </>
  );

  return (
    <form onSubmit={placeOrder}>
      <section className="mj-checkout-grid">
        <div className="mj-co-top">
          <Link
            href="/winkelwagen"
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              display: "inline-block",
              marginBottom: 18,
            }}
          >
            ← Terug naar winkelwagen
          </Link>
          <h1 className="mj-serif" style={{ fontSize: "var(--fs-h1)", color: "var(--color-text)", margin: "0 0 26px" }}>
            Afrekenen
          </h1>

          <div style={{ marginBottom: 28 }}>
            <div className="mj-serif" style={{ fontSize: 17, color: "var(--color-text)", marginBottom: 14 }}>
              Contactgegevens
            </div>
            <div className="mj-co-grid2">
              <input name="email" type="email" required placeholder="E-mailadres" style={inputStyle()} />
              <input name="phone" type="tel" required placeholder="Telefoonnummer" style={inputStyle()} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div className="mj-serif" style={{ fontSize: 17, color: "var(--color-text)", marginBottom: 14 }}>
              Factuur- en aflevergegevens
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="mj-co-grid2">
                <input name="firstName" required placeholder="Voornaam" style={inputStyle()} />
                <input name="lastName" required placeholder="Achternaam" style={inputStyle()} />
              </div>
              <input name="street" required placeholder="Straat en huisnummer" style={inputStyle()} />
              <div className="mj-co-gridzip">
                <input name="postalCode" required placeholder="Postcode" style={inputStyle()} />
                <input name="city" required placeholder="Plaats" style={inputStyle()} />
              </div>
              <input name="country" defaultValue="Nederland" placeholder="Land" style={inputStyle()} />
            </div>
          </div>
        </div>

        <div className="mj-co-payment">
          <div>
            <div className="mj-serif" style={{ fontSize: 17, color: "var(--color-text)", marginBottom: 14 }}>
              Betaalmethode
            </div>
            {ordered.length === 0 && (
              <div
                style={{
                  background: "var(--mj-error-light)",
                  color: "var(--mj-error)",
                  fontSize: 13,
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                  marginBottom: 8,
                }}
              >
                Betalingen zijn tijdelijk niet beschikbaar. Configureer een
                betaalmethode in het dashboard (Payments) voordat je live gaat.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ordered.map((m) => {
                const active = selected === m.type;
                if (m.type === "demo") {
                  return (
                    <MethodRow
                      key={m.type}
                      active={active}
                      onSelect={() => setSelected(m.type)}
                      left={
                        <>
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
                            <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
                          </svg>
                          <span style={{ fontSize: 14, color: "var(--color-text)" }}>
                            Test betaling
                          </span>
                        </>
                      }
                      right={
                        <div
                          style={{
                            height: 19,
                            padding: "0 8px",
                            borderRadius: 3,
                            background: "#f59e0b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 10,
                              color: "#1a1408",
                              letterSpacing: ".2px",
                            }}
                          >
                            TEST
                          </span>
                        </div>
                      }
                      panel={
                        <>
                          <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: "var(--color-text-soft)" }}>
                            Testmodus: je bestelling wordt direct als betaald
                            gemarkeerd. Er wordt geen echte betaling
                            afgeschreven.
                          </p>
                          <div style={{ marginBottom: 14 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--color-text)",
                                marginBottom: 10,
                              }}
                            >
                              Kaartgegevens (test)
                            </div>
                            <TestCardFields />
                          </div>
                          <LockNote>
                            Gebruik de testkaart hierboven of vul willekeurige
                            gegevens in. Zet testmodus uit in het dashboard vóór
                            echte bestellingen.
                          </LockNote>
                        </>
                      }
                    />
                  );
                }
                if (m.type === "high_risk") {
                  return (
                    <MethodRow
                      key={m.type}
                      active={active}
                      onSelect={() => setSelected(m.type)}
                      left={
                        <>
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
                            <rect x="2" y="5" width="20" height="14" rx="1.5" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                          <span style={{ fontSize: 14, color: "var(--color-text)" }}>
                            Creditcard / betaalkaart
                          </span>
                        </>
                      }
                      right={
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 30, height: 19, border: "1px solid var(--color-border)", borderRadius: 3, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontWeight: 700, fontSize: 10, color: "#1A1F71", letterSpacing: "-.3px" }}>VISA</span>
                          </div>
                          <div style={{ width: 30, height: 19, border: "1px solid var(--color-border)", borderRadius: 3, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <div style={{ position: "relative", width: 19, height: 11 }}>
                              <div style={{ position: "absolute", left: 0, top: 0, width: 11, height: 11, borderRadius: "50%", background: "#EB001B" }} />
                              <div style={{ position: "absolute", left: 8, top: 0, width: 11, height: 11, borderRadius: "50%", background: "#F79E1B", opacity: 0.9 }} />
                            </div>
                          </div>
                        </div>
                      }
                      panel={
                        <>
                          <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: "var(--color-text-soft)" }}>
                            Je wordt na het plaatsen van je bestelling veilig
                            doorgestuurd naar onze betalingsprovider om je
                            kaartbetaling af te ronden.
                          </p>
                          <LockNote>
                            Kaartgegevens worden veilig verwerkt door onze
                            betalingsprovider. {MJ_BRAND_NAME} slaat geen
                            kaartgegevens op.
                          </LockNote>
                        </>
                      }
                    />
                  );
                }
                if (m.type === "crypto") {
                  return (
                    <MethodRow
                      key={m.type}
                      active={active}
                      onSelect={() => setSelected(m.type)}
                      left={
                        <>
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7.5v9M9.3 9.5h3.7a1.7 1.7 0 0 1 0 3.4H9.3a1.7 1.7 0 0 0 0 3.4h4.4" />
                          </svg>
                          <span style={{ fontSize: 14, color: "var(--color-text)" }}>Crypto</span>
                        </>
                      }
                      panel={
                        <>
                          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>
                            Valuta
                          </div>
                          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                            {["BTC", "ETH", "USDC"].map((c) => {
                              const cActive = cryptoCurrency === c;
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setCryptoCurrency(c)}
                                  style={{
                                    flex: 1,
                                    padding: "8px 0",
                                    fontFamily: "var(--font-sans)",
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    border: `1px solid ${cActive ? "var(--color-primary)" : "var(--color-border)"}`,
                                    background: cActive ? "var(--color-primary)" : "var(--white)",
                                    color: cActive ? "var(--ivory)" : "var(--color-text)",
                                    borderRadius: "var(--radius-sm)",
                                    transition: "all 180ms var(--ease-standard)",
                                  }}
                                >
                                  {c}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                            <span style={{ fontSize: 13, color: "var(--color-text-soft)" }}>Te betalen</span>
                            <span className="mj-serif" style={{ fontSize: 20, color: "var(--color-text)" }}>
                              {mjPrice(total)}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--color-text-faint)", marginBottom: 16 }}>
                            Bedrag wordt automatisch omgerekend naar {cryptoCurrency} door de betalingsverwerker.
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 16,
                              alignItems: "center",
                              border: "1px dashed var(--color-border)",
                              borderRadius: "var(--radius-sm)",
                              padding: 16,
                            }}
                          >
                            <div
                              style={{
                                width: 64,
                                height: 64,
                                background: "var(--white)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--radius-sm)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.4">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                                <rect x="14" y="14" width="3" height="3" />
                                <rect x="18" y="18" width="3" height="3" />
                              </svg>
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>
                                Betaaladres ({cryptoCurrency})
                              </div>
                              <div
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                  color: "var(--color-text-soft)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                •••• wordt getoond na start betaling ••••
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--champagne)", flexShrink: 0 }} />
                            <span style={{ fontSize: 12.5, color: "var(--color-text-soft)" }}>
                              Wachten op betaling
                            </span>
                          </div>
                        </>
                      }
                    />
                  );
                }
                if (m.type === "bank_transfer") {
                  const row = (label: string, value: ReactNode) => (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 16 }}>
                      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                      <span style={{ color: "var(--color-text)", textAlign: "right" }}>{value}</span>
                    </div>
                  );
                  return (
                    <MethodRow
                      key={m.type}
                      active={active}
                      onSelect={() => setSelected(m.type)}
                      left={
                        <>
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
                            <path d="M3 10l9-6 9 6" />
                            <path d="M5 10v9M10 10v9M14 10v9M19 10v9" />
                            <path d="M3 21h18" />
                          </svg>
                          <span style={{ fontSize: 14, color: "var(--color-text)" }}>
                            Bankoverschrijving / IBAN
                          </span>
                        </>
                      }
                      panel={
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {row("Begunstigde", m.config.accountName || MJ_COMPANY_NAME)}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, gap: 16 }}>
                            <span style={{ color: "var(--color-text-muted)" }}>IBAN</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontFamily: "monospace", color: "var(--color-text)" }}>
                                {m.config.iban || "Wordt na bestelling verstuurd"}
                              </span>
                              {m.config.iban && (
                                <button
                                  type="button"
                                  onClick={copyIban}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--pine-800)",
                                    fontSize: 12,
                                    textDecoration: "underline",
                                    padding: 0,
                                  }}
                                >
                                  {copiedIban ? "Gekopieerd ✓" : "Kopieer IBAN"}
                                </button>
                              )}
                            </span>
                          </div>
                          {m.config.bic ? row("BIC / SWIFT", m.config.bic) : null}
                          {row(
                            "Bedrag",
                            <span style={{ fontWeight: 600 }}>{mjPrice(total)}</span>,
                          )}
                          {row(
                            "Betalingskenmerk",
                            <span style={{ color: "var(--color-text-soft)", maxWidth: 220 }}>
                              Wordt na bestelling per e-mail verstuurd
                            </span>,
                          )}
                        </div>
                      }
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: "10px 16px",
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--color-border)",
            }}
          >
            {[
              {
                label: "Veilige betaling",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
                    <rect x="4" y="10" width="16" height="10" rx="1" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                ),
              },
              {
                label: "Beschermde gegevens",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
                    <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />
                  </svg>
                ),
              },
              {
                label: "Discrete verwerking",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
                    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
                    <path d="M3 8v8l9 5 9-5V8" />
                  </svg>
                ),
              },
              {
                label: "Klantenservice via WhatsApp",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-primary)" }}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
                  </svg>
                ),
              },
            ].map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {t.icon}
                <span style={{ fontSize: 12.5, color: "var(--color-text-soft)" }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mj-co-summary">
          {/* Desktop header */}
          <div
            className="mj-summary-desktop-head"
            onClick={() => {
              if (window.matchMedia("(max-width:900px)").matches) {
                setSummaryOpen((v) => !v);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div className="mj-serif" style={{ fontSize: 18, color: "var(--color-text)" }}>
              Besteloverzicht
            </div>
            <div className="mj-only-mobile-900">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: "var(--color-text)" }}>
                  {mjPrice(total)}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: summaryOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 240ms var(--ease-standard)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
          <div className="mj-summary-items" data-open={summaryOpen ? "1" : "0"}>
            {summaryItems}
          </div>
          <div className="mj-summary-checkout">{summaryCheckout}</div>
        </div>
      </section>

      <div className="mj-co-mobile-bar">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Totaal</div>
          <div className="mj-serif" style={{ fontWeight: 600, fontSize: 18, color: "var(--color-text)" }}>
            {mjPrice(total)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, maxWidth: 240 }}>
          {submitButton("mj-co-submit-mobile")}
        </div>
      </div>
    </form>
  );
}
