"use client";

// The Clinic design-system primitives (ported from the design handoff).

import { useState, type ReactNode } from "react";
import { mjPrice, type MjDosage } from "@/lib/mj/data";

export function PriceDisplay({
  now,
  was,
  size = "md",
}: {
  now: number;
  was?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const fs =
    size === "lg"
      ? "var(--fs-price)"
      : size === "sm"
        ? "var(--fs-price-sm)"
        : "1.375rem";
  const pct = was ? Math.round((1 - now / was) * 100) : null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      {was ? (
        <span
          style={{
            fontSize: "0.6em",
            color: "var(--color-text-faint)",
            textDecoration: "line-through",
          }}
        >
          {mjPrice(was)}
        </span>
      ) : null}
      <span
        className="mj-price-now"
        style={{
          fontWeight: 600,
          fontSize: fs,
          color: "var(--color-text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {mjPrice(now)}
      </span>
      {pct != null && pct > 0 && (
        <span className="mj-discount-badge">{pct}% KORTING</span>
      )}
    </span>
  );
}

export function DosageSelector({
  options,
  value,
  onChange,
}: {
  options: MjDosage[];
  value: string;
  onChange: (mg: string) => void;
}) {
  return (
    <div>
      <div className="mj-eyebrow" style={{ marginBottom: 10 }}>
        Sterkte (mg)
      </div>
      <div
        className="mj-dose-grid"
        style={{
          gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, 1fr)`,
        }}
      >
        {options.map((opt) => {
          const selected = opt.mg === value;
          return (
            <button
              key={opt.mg}
              type="button"
              className={`mj-dose-btn${selected ? " is-selected" : ""}`}
              onClick={() => onChange(opt.mg)}
            >
              {opt.mg} mg
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 12,
  compact = false,
}: {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}) {
  return (
    <div className={`mj-qty${compact ? " mj-qty-compact" : ""}`}>
      <button
        type="button"
        aria-label="Minder"
        className="mj-qty-btn"
        onClick={() => onChange(Math.max(min - 1, value - 1))}
      >
        –
      </button>
      <span className="mj-qty-value">{value}</span>
      <button
        type="button"
        aria-label="Meer"
        className="mj-qty-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}

export function WishlistButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 500,
        color: active ? "var(--color-primary)" : "var(--color-text-muted)",
        padding: "10px 4px",
        minHeight: 44,
      }}
    >
      <span style={{ fontSize: 15, color: active ? "var(--color-primary)" : "var(--color-text-muted)" }}>{active ? "♥" : "♡"}</span>{" "}
      {active ? "Op verlanglijst" : "Toevoegen aan verlanglijst"}
    </button>
  );
}

export function TrustBadge({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 14,
        color: "var(--color-text)",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--pine-100)",
          color: "var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        ✓
      </span>
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div
        className="mj-serif"
        style={{ fontSize: 22, marginBottom: 8, color: "var(--color-text)" }}
      >
        {title}
      </div>
      <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
        {description}
      </div>
    </div>
  );
}

export function FaqAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mj-faq">
      {items.map((it, i) => (
        <div key={it.q} className={`mj-faq-item${open === i ? " mj-faq-open" : ""}`}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
            className="mj-faq-q"
          >
            {it.q}
            <span className="mj-faq-icon" aria-hidden>
              +
            </span>
          </button>
          <div className="mj-faq-a">
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Fades a section up the first time it enters the viewport. */
export { Reveal, Parallax, ScrollProgress } from "./Motion";

