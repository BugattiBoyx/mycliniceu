import Link from "next/link";
import {
  MJ_BRAND_EMAIL,
  MJ_BRAND_NAME,
  MJ_COPYRIGHT,
  MJ_PHARMACY_NAME,
} from "@/lib/mj/brand";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/winkel", label: "Winkel" },
  { href: "/#recensies", label: "Recensies" },
  { href: "/#contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacybeleid", label: "Privacybeleid" },
  { href: "/verzendinformatie", label: "Verzendinformatie" },
  { href: "/retourbeleid", label: "Retourbeleid" },
  { href: "/betalingsbeleid", label: "Betalingsbeleid" },
  { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
];

const colHead: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  opacity: 0.55,
  marginBottom: 16,
};

const colLinks: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  fontSize: 14,
  opacity: 0.9,
};

export function MjFooter() {
  return (
    <footer
      id="contact"
      className="mj-footer"
      style={{
        background: "var(--pine-900)",
        color: "var(--color-text-on-primary)",
        padding: "72px var(--gutter) 32px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
        <div className="mj-footer-grid">
          <div>
            <div className="mj-serif" style={{ fontSize: 22, marginBottom: 16, letterSpacing: "-0.04em" }}>
              {MJ_BRAND_NAME}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.8 }}>
              Apotheek: {MJ_PHARMACY_NAME}
              <br />
              Hoofdapotheker: Mark van Dijk
              <br />
              <br />
              {MJ_BRAND_EMAIL}
              <br />
              Industrieweg 5, 5527 AJ Hapert, Nederland
            </div>
          </div>
          <div>
            <div style={colHead}>Snelle koppelingen</div>
            <div style={colLinks}>
              {QUICK_LINKS.map((l) => (
                <Link key={l.label} href={l.href} style={{ color: "var(--color-text-on-primary)" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div style={colHead}>Juridisch</div>
            <div style={colLinks}>
              {LEGAL_LINKS.map((l) => (
                <Link key={l.label} href={l.href} style={{ color: "var(--color-text-on-primary)" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div style={colHead}>Nieuwsbrief</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 16, lineHeight: 1.6 }}>
              Schrijf u in en mis nooit meer een update of exclusieve aanbieding.
            </div>
            <div
              style={{
                display: "flex",
                border: "1px solid rgba(255,255,255,.25)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
              }}
            >
              <input
                placeholder="Uw e-mailadres"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "transparent",
                  border: "none",
                  color: "var(--ivory)",
                  padding: "12px 14px",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <button
                type="button"
                style={{
                  background: "var(--ivory)",
                  color: "var(--pine-900)",
                  border: "none",
                  padding: "12px 18px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Abonneren
              </button>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            paddingTop: 24,
            fontSize: 12,
            opacity: 0.55,
          }}
        >
          <span>{MJ_COPYRIGHT}</span>
          <div style={{ display: "flex", gap: 10, opacity: 0.9 }}>
            {["iDEAL", "Bancontact", "Visa", "Mastercard", "PayPal"].map((p) => (
              <span
                key={p}
                style={{
                  border: "1px solid rgba(255,255,255,.25)",
                  borderRadius: "var(--radius-sm)",
                  padding: "4px 8px",
                  fontSize: 11,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
