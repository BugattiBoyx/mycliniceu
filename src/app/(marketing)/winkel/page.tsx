import type { Metadata } from "next";
import { ShopCard } from "@/components/mj/ShopCard";
import { Reveal } from "@/components/mj/ui";
import { buildMjMetadata } from "@/lib/mj/metadata";

export const metadata: Metadata = buildMjMetadata({
  title: "Onze behandelingen",
  description:
    "Bekijk Mounjaro en Ozempic, selecteer de juiste sterkte en bestel direct online.",
  path: "/winkel",
});

export default function WinkelPage() {
  return (
    <div>
      <section className="mj-shop-hero">
        <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", position: "relative" }}>
          <Reveal variant="left">
            <h1
              className="mj-serif"
              style={{
                fontSize: "var(--fs-h1)",
                color: "var(--color-text)",
                margin: "0 0 16px",
                maxWidth: 640,
              }}
            >
              Onze behandelingen
            </h1>
            <p
              style={{
                fontSize: "var(--fs-body-lg)",
                color: "var(--color-text-soft)",
                maxWidth: 560,
                margin: 0,
              }}
            >
              Bekijk Mounjaro en Ozempic, selecteer de juiste sterkte en bestel
              direct online.
            </p>
          </Reveal>
        </div>
      </section>

      <section
        style={{
          padding: "24px var(--gutter) var(--section-pad-y)",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
        }}
      >
        <div className="mj-shop-grid">
          <Reveal delay={40} variant="up">
            <ShopCard productKey="mounjaro" />
          </Reveal>
          <Reveal delay={120} variant="up">
            <ShopCard productKey="ozempic" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
