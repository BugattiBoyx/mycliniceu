import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnMount } from "@/components/mj/ClearCartOnMount";
import { getWhatsAppUrl, mjPrice, WHATSAPP_DISPLAY } from "@/lib/mj/data";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Bestelling bevestigd",
};

export const dynamic = "force-dynamic";

const NEXT_STEPS = [
  {
    title: "Bevestiging per e-mail",
    text: "Je ontvangt binnen enkele minuten een orderbevestiging met alle details van je bestelling.",
  },
  {
    title: "Medische beoordeling",
    text: "Een BIG-geregistreerde arts beoordeelt je aanvraag en schrijft bij goedkeuring het recept voor.",
  },
  {
    title: "Discrete verzending",
    text: "Je bestelling wordt gekoeld en in neutrale verpakking verzonden. Je ontvangt een track & trace-code.",
  },
];

export default async function BestellingBevestigdPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  const order = orderNumber
    ? await prisma.order.findFirst({
        where: { number: orderNumber, store: { slug: "moun-journey" } },
        include: { items: true },
      })
    : null;

  return (
    <section
      style={{
        padding: "80px var(--gutter) var(--section-pad-y)",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <ClearCartOnMount />

      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--mj-success-light)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mj-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1
          className="mj-serif"
          style={{ fontSize: "var(--fs-h1)", color: "var(--color-text)", margin: "0 0 14px" }}
        >
          Bedankt voor je bestelling
        </h1>
        {order ? (
          <p style={{ fontSize: 15, color: "var(--color-text-soft)", margin: 0 }}>
            Bestelnummer{" "}
            <strong style={{ color: "var(--color-text)" }}>{order.number}</strong>
            {order.email ? (
              <>
                {" "}
                — de bevestiging is onderweg naar{" "}
                <strong style={{ color: "var(--color-text)" }}>{order.email}</strong>
              </>
            ) : null}
          </p>
        ) : (
          <p style={{ fontSize: 15, color: "var(--color-text-soft)", margin: 0 }}>
            Je bestelling is geplaatst. De bevestiging is onderweg per e-mail.
          </p>
        )}
      </div>

      {order && (
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 24,
            marginBottom: 40,
          }}
        >
          <div className="mj-serif" style={{ fontSize: 17, color: "var(--color-text)", marginBottom: 16 }}>
            Besteloverzicht
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: 14,
                }}
              >
                <span style={{ color: "var(--color-text)" }}>
                  {item.title} · {item.variantLabel}{" "}
                  <span style={{ color: "var(--color-text-muted)" }}>× {item.quantity}</span>
                </span>
                <span style={{ color: "var(--color-text)", whiteSpace: "nowrap" }}>
                  {mjPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 14 }}>
            {(() => {
              const itemsSum = order.items.reduce(
                (n, i) => n + i.unitPrice * i.quantity,
                0,
              );
              const discount = itemsSum - order.total;
              return discount > 0.005 ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13.5,
                    color: "var(--sage)",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  <span>Korting</span>
                  <span>-{mjPrice(discount)}</span>
                </div>
              ) : null;
            })()}
            <div
              className="mj-serif"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 20,
                color: "var(--color-text)",
              }}
            >
              <span>Totaal</span>
              <span>{mjPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 48 }}>
        <div className="mj-serif" style={{ fontSize: 20, color: "var(--color-text)", marginBottom: 20 }}>
          Wat gebeurt er nu?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {NEXT_STEPS.map((step, i) => (
            <div key={step.title} style={{ display: "flex", gap: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1.5px solid var(--color-primary)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--color-text)", marginBottom: 4 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--color-text-soft)" }}>
                  {step.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-md)",
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 40,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--color-text)", marginBottom: 4 }}>
            Vragen over je bestelling?
          </div>
          <div style={{ fontSize: 13.5, color: "var(--color-text-soft)" }}>
            Ons team staat voor je klaar via WhatsApp: {WHATSAPP_DISPLAY}
          </div>
        </div>
        <a
          href={getWhatsAppUrl("Hoi! Ik heb een vraag over mijn bestelling.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mj-btn mj-btn-secondary"
        >
          Chat via WhatsApp
        </a>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/" className="mj-btn mj-btn-primary mj-btn-lg">
          Terug naar home
        </Link>
      </div>
    </section>
  );
}
