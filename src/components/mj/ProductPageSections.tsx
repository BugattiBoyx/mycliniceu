"use client";

import Image from "next/image";
import { CountUp, Reveal, useInView } from "@/components/mj/Motion";
import { MJ_PRODUCT_EDUCATION, type MjProductKey } from "@/lib/mj/data";

/** "96,3% verloor minstens 5%" → a headline figure and its qualifier. */
function splitMilestone(text: string) {
  const at = text.indexOf(" ");
  return at === -1
    ? { figure: text, caption: "" }
    : { figure: text.slice(0, at), caption: text.slice(at + 1) };
}

function EfficacyChart({
  bars,
  maxPct,
  caption,
}: {
  bars: { label: string; pct: number; color: string }[];
  maxPct: number;
  caption: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div className="mj-pdp-efficacy-chart" ref={ref}>
      <p className="mj-pdp-efficacy-chart-note">{caption}</p>
      {bars.map((bar, i) => (
        <div key={bar.label} className="mj-pdp-bar-row">
          <div className="mj-pdp-bar-meta">
            <span className="mj-pdp-bar-label">{bar.label}</span>
            <span className="mj-pdp-bar-pct">
              −{String(bar.pct).replace(".", ",")}%
            </span>
          </div>
          <div className="mj-pdp-bar-track">
            <div
              className="mj-pdp-bar-fill"
              style={{
                width: inView ? `${(bar.pct / maxPct) * 100}%` : 0,
                background: bar.color,
                transitionDelay: `${i * 110}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductPageSections({ productKey }: { productKey: MjProductKey }) {
  const edu = MJ_PRODUCT_EDUCATION[productKey];
  if (!edu) return null;

  const maxPct = Math.max(...edu.efficacyBars.map((b) => b.pct), 1);
  const deliveryImage =
    productKey === "mounjaro"
      ? "/products/mounjaro-pens-transparent.png"
      : "/products/ozempic-pens-transparent.png";

  return (
    <div className="mj-pdp-edu">
      <section className="mj-pdp-edu-block mj-pdp-edu-timing">
        <Reveal variant="up">
          <h2 className="mj-serif mj-pdp-edu-title">{edu.timingTitle}</h2>
        </Reveal>
        <div className="mj-pdp-edu-prose">
          {edu.timingBody.map((p, i) => (
            <Reveal key={p} variant="up" delay={80 + i * 90}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mj-pdp-edu-block">
        <Reveal variant="up">
          <h2 className="mj-serif mj-pdp-edu-title">{edu.summaryTitle}</h2>
        </Reveal>
        <div className="mj-pdp-summary" role="table" aria-label={edu.summaryTitle}>
          {edu.summaryRows.map((row, i) => (
            <Reveal key={row.label} variant="up" delay={Math.min(i * 60, 300)}>
              <div className="mj-pdp-summary-row" role="row">
                <div className="mj-pdp-summary-label" role="rowheader">
                  {row.label}
                </div>
                <div className="mj-pdp-summary-value" role="cell">
                  {row.value}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mj-pdp-edu-block">
        <Reveal variant="up">
          <h2 className="mj-serif mj-pdp-edu-title mj-pdp-edu-title-left">
            {edu.efficacyTitle}
          </h2>
        </Reveal>

        <Reveal variant="up" delay={60}>
          <p className="mj-pdp-efficacy-lede">
            {edu.efficacyIntro}{" "}
            <strong className="mj-pdp-efficacy-hl">{edu.efficacyHighlight}</strong>.
          </p>
        </Reveal>

        <div className="mj-pdp-milestones">
          {edu.efficacyMilestones.map((item, i) => {
            const { figure, caption } = splitMilestone(item);
            return (
              <Reveal key={item} variant="up" delay={i * 90}>
                <div className="mj-pdp-milestone">
                  <CountUp className="mj-pdp-milestone-figure">{figure}</CountUp>
                  <span className="mj-pdp-milestone-caption">{caption}</span>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mj-pdp-efficacy">
          <div className="mj-pdp-efficacy-copy">
            <Reveal variant="up">
              <p className="mj-pdp-efficacy-factors-title">
                {edu.efficacyFactorsTitle}
              </p>
            </Reveal>
            <Reveal variant="up" delay={80}>
              <ul className="mj-pdp-efficacy-list">
                {edu.efficacyFactors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal variant="up" delay={120}>
            <EfficacyChart
              bars={edu.efficacyBars}
              maxPct={maxPct}
              caption={edu.efficacyChartNote}
            />
          </Reveal>
        </div>
        <p className="mj-pdp-edu-disclaimer">{edu.disclaimer}</p>
      </section>

      <section className="mj-pdp-edu-block">
        <div
          className="mj-service-grid"
          style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}
        >
          <Reveal variant="left">
            <div className="mj-service-media">
              <Image
                src={deliveryImage}
                alt={
                  productKey === "mounjaro"
                    ? "Mounjaro KwikPen — alle doseringen"
                    : "Ozempic injectiepen"
                }
                width={684}
                height={500}
                className="mj-service-img"
              />
            </div>
          </Reveal>
          <Reveal variant="right" delay={80}>
            <div>
              <div className="mj-eyebrow" style={{ marginBottom: 16 }}>
                Levering
              </div>
              <h2
                className="mj-serif"
                style={{
                  fontSize: "var(--fs-h2)",
                  color: "var(--color-text)",
                  margin: "0 0 20px",
                }}
              >
                Verstuurd in neutrale verpakking
              </h2>
              <p
                style={{
                  fontSize: "var(--fs-body-lg)",
                  lineHeight: "var(--lh-body)",
                  color: "var(--color-text-soft)",
                  maxWidth: 460,
                  margin: "0 0 20px",
                }}
              >
                Je bestelling wordt binnen enkele werkdagen geleverd, verpakt in
                neutrale, discrete verpakking zonder herkenbare kenmerken. Zodra je
                pakket is verzonden, ontvang je een trackingcode.
              </p>
              <ul className="mj-clinic-checklist">
                <li>Gekoelde, veilige verzending</li>
                <li>Geen merknaam op de buitenkant</li>
                <li>Track &amp; trace zodra verzonden</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
