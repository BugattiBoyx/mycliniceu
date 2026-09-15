import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HomeProductRow } from "@/components/mj/HomeProductRow";
import { CountUp, ScrollLine } from "@/components/mj/Motion";
import { FaqAccordion, Reveal } from "@/components/mj/ui";
import { MJ_BRAND_NAME } from "@/lib/mj/brand";
import { MJ_FAQ } from "@/lib/mj/data";

const STATS = [
  {
    value: "10-22%",
    label: "verlies van lichaamsgewicht",
    source: "NEJM-onderzoek naar tirzepatide en semaglutide",
  },
  {
    value: "97%",
    label: "meldt verbeterd zelfvertrouwen en gezondheid",
    source: "Enquête onder 215 actieve patiënten, februari 2023",
  },
  {
    value: "25.000+",
    label: "consultaties verzorgd",
    source: `Sinds de start van ${MJ_BRAND_NAME}`,
  },
];

const benefitIcon = (path: ReactNode) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {path}
  </svg>
);

const BENEFITS = [
  {
    title: "Klinische ondersteuning",
    text: "Elke behandeling wordt beoordeeld en gevolgd door BIG-geregistreerde zorgverleners.",
    icon: benefitIcon(
      <>
        <path d="M12 3l7.5 3.5v5c0 4.4-3.1 7.6-7.5 9-4.4-1.4-7.5-4.6-7.5-9v-5L12 3z" />
        <path d="M12 9v6M9 12h6" />
      </>,
    ),
  },
  {
    title: "Gratis, discrete levering",
    text: "Snel en discreet bij je thuis afgeleverd, zonder extra kosten.",
    icon: benefitIcon(
      <>
        <rect x="2.5" y="7.5" width="12" height="9" rx="1" />
        <path d="M14.5 10.5h4l3 3v3h-7z" />
        <circle cx="7" cy="18.5" r="1.8" />
        <circle cx="18" cy="18.5" r="1.8" />
      </>,
    ),
  },
  {
    title: "Volledige controle",
    text: "Pauzeer, wijzig of zeg op wanneer je wilt. Geen langlopende verplichtingen.",
    icon: benefitIcon(
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5l3 2" />
      </>,
    ),
  },
  {
    title: "Nederlandse experts",
    text: "Begeleiding door Nederlandse artsen en apothekers, elke stap van de weg.",
    icon: benefitIcon(
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>,
    ),
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Vul de vragenlijst in",
    text: "Beantwoord vragen over je gezondheid, leefstijl en medische geschiedenis.",
  },
  {
    n: "02",
    title: "Beoordeling door een arts",
    text: "Een BIG-geregistreerde zorgverlener beoordeelt je antwoorden en bepaalt de juiste behandeling.",
  },
  {
    n: "03",
    title: "Bestel je behandeling",
    text: "Na goedkeuring bestel je direct online en betaal je veilig.",
  },
  {
    n: "04",
    title: "Gratis, discrete levering",
    text: "Je behandeling wordt discreet en snel thuis afgeleverd.",
  },
];

const DOCTORS = [
  {
    name: "Mark van Dijk",
    role: "Hoofd Apotheker",
    image: "/doctors/mark-van-dijk.jpg",
  },
  {
    name: "Marieke Jansen",
    role: "Huisarts",
    image: "/doctors/marieke-jansen.jpg",
  },
];

const REVIEWS = [
  {
    quote:
      "“Ik heb het gevoel dat ik een langer, gelukkiger leven kan leiden met minder risico op hart- en vaatziekten. Ik heb vele jaren geworsteld met overgewicht, dus de impact is levensveranderend geweest.”",
    name: "Julia, 64",
    result: "-12 kg in 4 maanden",
    before: "/reviews/julia_before.webp",
    after: "/reviews/julia_after.webp",
    alt: "Julia, voor en na",
    flip: false,
  },
  {
    quote:
      "“Ik ontdekte een oude tas met kleren en kon niet geloven hoeveel ervan mij pasten waar ik eerder geen kans had gehad. Ik voel me geweldig. Ik denk dat ik er veel beter uitzie dan ooit tevoren.”",
    name: "Andy, 55",
    result: "-6 kg in 7 weken",
    before: "/reviews/andy_before.webp",
    after: "/reviews/andy_after.webp",
    alt: "Andy, voor en na",
    flip: true,
  },
  {
    quote:
      "“Er is dit jaar een enorme verandering geweest. Ik voel me een ander persoon. Ik zie mezelf meer lachen en ik heb niemand nodig die me vertelt dat ik mooi ben. Ik weet dat ik dat ben.”",
    name: "Emma, 47",
    result: "-9,5 kg in 7 maanden",
    before: "/reviews/emma_before.webp",
    after: "/reviews/emma_after.webp",
    alt: "Emma, voor en na",
    flip: false,
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mj-hero-wrap" aria-label="Introductie">
        <div className="mj-hero-panel">
          <div className="mj-hero-copy">
            <div className="mj-tp-row">
              <span className="mj-tp-row-stars" aria-hidden>
                ★★★★★
              </span>
              <span>
                <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>4,7</strong>
                {" "}Trustpilot · BIG-geregistreerde artsen
              </span>
            </div>
            <h1
              className="mj-serif"
              style={{
                fontSize: "var(--fs-display)",
                lineHeight: "var(--lh-display)",
                margin: 0,
                color: "var(--color-text)",
                textWrap: "balance",
              }}
            >
              Medisch gewichtsverlies, vanaf je eigen huis
            </h1>
            <span className="mj-price-pill">Vanaf €179 per behandeling</span>
            <p
              style={{
                fontSize: "var(--fs-body-lg)",
                color: "var(--color-text-soft)",
                maxWidth: 440,
                lineHeight: "var(--lh-body)",
                margin: "0 0 22px",
              }}
            >
              {MJ_BRAND_NAME} combineert GLP-1-medicatie met begeleiding van
              Nederlandse artsen. Online intake, recept en discrete levering.
            </p>
            <ul className="mj-clinic-checklist" style={{ marginBottom: 28 }}>
              <li>Bewezen afslankprogramma vanaf €179</li>
              <li>Onbeperkte medische ondersteuning</li>
              <li>Veilig, discreet en 100% online</li>
            </ul>
            <div className="mj-hero-cta-row" style={{ marginBottom: 0 }}>
              <a href="/winkel" className="mj-btn mj-btn-primary mj-btn-lg">
                Kom ik in aanmerking?
              </a>
              <a href="#hoe" className="mj-btn mj-btn-quiet mj-btn-lg">
                Meer informatie
              </a>
            </div>
          </div>
          <div className="mj-hero-photo">
            <Image
              src="/doctors/marieke-jansen.jpg"
              alt={`BIG-geregistreerde arts van ${MJ_BRAND_NAME}`}
              fill
              priority
              sizes="(max-width: 1180px) 100vw, 560px"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
        </div>
        <div className="mj-press-row" aria-hidden>
          <span>BIG-register</span>
          <span>Nederlandse apotheek</span>
          <span>Trustpilot 4,7</span>
          <span>Discrete levering</span>
          <span>GLP-1</span>
        </div>
      </section>

      {/* 2. Soft proof band */}
      <section className="mj-soft-band" style={{ padding: "clamp(40px, 5vw, 64px) var(--gutter)" }}>
        <div className="mj-stats-soft" style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
          {STATS.map((s, i) => (
            <Reveal key={s.value + s.label} delay={i * 90} variant="up">
              <div>
                <CountUp className="mj-stat-value">{s.value}</CountUp>
                <div style={{ fontSize: 15, marginTop: 8, color: "var(--color-text)", fontWeight: 500, textWrap: "pretty" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: "var(--color-text-muted)" }}>
                  {s.source}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Featured products */}
      <section
        id="winkel"
        className="mj-panel-mint"
        style={{
          padding: "var(--section-pad-y) var(--gutter)",
          scrollMarginTop: 88,
        }}
      >
        <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
          <Reveal>
            <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", margin: "0 0 12px", maxWidth: 640, color: "var(--color-text)" }}>
              Jouw doorbraak begint hier
            </h2>
            <p style={{ fontSize: "var(--fs-body-lg)", color: "var(--color-text-soft)", maxWidth: 520, margin: "0 0 40px", lineHeight: "var(--lh-body)" }}>
              Klinisch bewezen GLP-1-behandelingen, begeleid door Nederlandse artsen.
            </p>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <Reveal delay={60} variant="left">
              <HomeProductRow productKey="mounjaro" />
            </Reveal>
            <Reveal delay={140} variant="right">
              <HomeProductRow productKey="ozempic" />
            </Reveal>
          </div>
          <Reveal delay={80} style={{ marginTop: 28 }}>
            <Link href="/winkel" className="mj-btn mj-btn-text">
              Bekijk alle behandelingen →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5. Scientific evidence */}
      <section style={{ padding: "var(--section-pad-y) var(--gutter)", maxWidth: "var(--content-max)", margin: "0 auto" }}>
        <Reveal>
          <div className="mj-science-grid">
            <div>
              <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", color: "var(--color-text)", margin: "0 0 20px" }}>
                Ondersteund door de wetenschap
              </h2>
              <p style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-body)", color: "var(--color-text-soft)", maxWidth: 420, margin: "0 0 16px" }}>
                Klinische studies naar tirzepatide en semaglutide tonen
                aanzienlijk gewichtsverlies wanneer medicatie wordt gecombineerd
                met medische begeleiding.
              </p>
              <p style={{ fontSize: 13, color: "var(--color-text-faint)", margin: 0 }}>
                Bron: NEJM-onderzoek naar tirzepatide en semaglutide.
              </p>
            </div>
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-image)",
                padding: "clamp(18px, 3vw, 32px)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <svg viewBox="0 0 600 300" width="100%" style={{ display: "block" }}>
                <line x1="50" y1="40" x2="560" y2="40" stroke="var(--color-border)" strokeWidth="1" />
                <line x1="50" y1="131" x2="560" y2="131" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3,4" />
                <line x1="50" y1="222" x2="560" y2="222" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3,4" />
                <text x="14" y="44" fontFamily="var(--font-sans)" fontSize="22" fill="var(--color-text-muted)">0%</text>
                <text x="4" y="135" fontFamily="var(--font-sans)" fontSize="22" fill="var(--color-text-muted)">-10%</text>
                <text x="4" y="226" fontFamily="var(--font-sans)" fontSize="22" fill="var(--color-text-muted)">-20%</text>
                <path d="M60,42 C160,55 260,100 360,150 C440,190 500,205 540,208" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M60,42 C160,46 260,54 360,60 C440,64 500,66 540,68" fill="none" stroke="var(--color-text-faint)" strokeWidth="2" strokeDasharray="5,5" strokeLinecap="round" />
                <circle cx="540" cy="208" r="4" fill="var(--color-primary)" />
                <circle cx="540" cy="68" r="4" fill="var(--color-text-faint)" />
                <text x="50" y="262" fontFamily="var(--font-sans)" fontSize="22" fill="var(--color-text-muted)">Week 0</text>
                <text x="245" y="262" fontFamily="var(--font-sans)" fontSize="22" fill="var(--color-text-muted)">Week 36</text>
                <text x="495" y="262" fontFamily="var(--font-sans)" fontSize="22" fill="var(--color-text-muted)">Week 72</text>
              </svg>
              <div style={{ display: "flex", gap: 24, marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-soft)" }}>
                  <span style={{ width: 16, height: 2, background: "var(--color-primary)", display: "inline-block" }} />
                  Met {MJ_BRAND_NAME}-behandeling
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-soft)" }}>
                  <span
                    style={{
                      width: 16,
                      height: 2,
                      backgroundImage:
                        "repeating-linear-gradient(90deg,var(--color-text-faint) 0 4px,transparent 4px 7px)",
                      display: "inline-block",
                    }}
                  />
                  Alleen leefstijlaanpassing
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-faint)", marginTop: 14 }}>
                Illustratieve weergave op basis van gepubliceerd onderzoek.
                Individuele resultaten kunnen variëren.
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 6. Value proposition */}
      <section className="mj-panel-mint" style={{ padding: "var(--section-pad-y) var(--gutter)", textAlign: "left" }}>
        <Reveal>
          <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
          <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", color: "var(--color-text)", maxWidth: 560, margin: "0 0 12px" }}>
            Eenvoudig. Medisch begeleid.
          </h2>
          <p style={{ fontSize: "var(--fs-body-lg)", color: "var(--color-text-soft)", maxWidth: 480, margin: 0, lineHeight: "var(--lh-body)", textWrap: "pretty" }}>
            Van online intake tot levering aan de deur. Elke stap begeleid door
            Nederlandse zorgverleners.
          </p>
          </div>
        </Reveal>
      </section>

      {/* 7. Delivery / service */}
      <section style={{ background: "var(--white)", padding: "var(--section-pad-y) var(--gutter)" }}>
        <Reveal>
          <div className="mj-service-grid" style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
            <div className="mj-service-media mj-product-stage">
              <Image
                src="/products/mounjaro-pens-transparent.png"
                alt="Mounjaro KwikPen, alle doseringen"
                width={684}
                height={500}
                className="mj-service-img"
                priority={false}
              />
            </div>
            <div>
              <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", color: "var(--color-text)", margin: "0 0 20px" }}>
                Verstuurd in neutrale verpakking
              </h2>
              <p style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-body)", color: "var(--color-text-soft)", maxWidth: 460, margin: "0 0 20px" }}>
                Je bestelling wordt binnen enkele werkdagen geleverd, verpakt in
                neutrale, discrete verpakking zonder herkenbare kenmerken. Zodra
                je pakket is verzonden, ontvang je een trackingcode.
              </p>
              <ul className="mj-clinic-checklist">
                <li>Gekoelde, veilige verzending</li>
                <li>Geen merknaam op de buitenkant</li>
                <li>Track &amp; trace zodra verzonden</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8. Waarom The Clinic */}
      <section style={{ padding: "var(--section-pad-y) var(--gutter)", maxWidth: "var(--content-max)", margin: "0 auto" }}>
        <Reveal>
          <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", color: "var(--color-text)", margin: "0 0 48px", maxWidth: 640 }}>
            Persoonlijke medische zorg, zonder wachtkamers.
          </h2>
          <div className="mj-benefits-grid">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 70} variant="up">
                <div className="mj-benefit-tile">
                  <div className="mj-benefit-icon">{b.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: "var(--color-text)", marginBottom: 8 }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
                    {b.text}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 9. Hoe werkt het */}
      <section id="hoe" className="mj-panel-sky" style={{ padding: "var(--section-pad-y) var(--gutter)", scrollMarginTop: 88 }}>
        <Reveal>
          <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
            <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", color: "var(--color-text)", margin: "0 0 56px", maxWidth: 640 }}>
              Start in slechts enkele minuten.
            </h2>
            <div className="mj-how-desktop">
              <ScrollLine />
              {HOW_STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 80} variant="up">
                  <div className="mj-how-step">
                    <div className="mj-how-n">{s.n}</div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: "var(--color-text)", marginBottom: 8 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
                      {s.text}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mj-how-mobile">
              <div style={{ position: "relative" }}>
                <ScrollLine orientation="vertical" className="mj-how-mobile-line" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {HOW_STEPS.map((s, i) => (
                    <Reveal key={s.n} delay={i * 60}>
                      <div style={{ display: "flex", gap: 18, paddingBottom: i === HOW_STEPS.length - 1 ? 0 : 32 }}>
                        <div
                          className="mj-serif"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "var(--white)",
                            border: "1px solid var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: 13,
                            color: "var(--color-primary)",
                            position: "relative",
                          }}
                        >
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, paddingTop: 2 }}>
                          <div style={{ fontWeight: 600, fontSize: 16, color: "var(--color-text)", marginBottom: 6 }}>
                            {s.title}
                          </div>
                          <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
                            {s.text}
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 10. Doctors */}
      <section
        id="artsen"
        style={{
          padding: "var(--section-pad-y) var(--gutter)",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          scrollMarginTop: 88,
        }}
      >
        <Reveal>
          <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", margin: "0 0 12px", maxWidth: 640, color: "var(--color-text)" }}>
            Gecertificeerde en BIG-geregistreerde experts
          </h2>
          <p style={{ maxWidth: 640, color: "var(--color-text-soft)", margin: "0 0 48px", fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-body)" }}>
            Ons team bestaat uit gecertificeerde en BIG-geregistreerde
            zorgverleners, gespecialiseerd in het behandelen van chronische
            aandoeningen zoals overgewicht.
          </p>
          <div className="mj-doctors-grid">
            {DOCTORS.map((d, i) => (
              <Reveal key={d.name} delay={i * 90} variant="up">
                <div className="mj-doctor-card">
                  <div
                    style={{
                      aspectRatio: "4/5",
                      background: "var(--stone)",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(max-width: 1180px) 50vw, 300px"
                      style={{ objectFit: "cover", objectPosition: "top center" }}
                      className="mj-photo"
                    />
                  </div>
                  <div className="mj-doctor-body">
                    <div className="mj-serif mj-doctor-name">{d.name}</div>
                    <div className="mj-doctor-role">{d.role}</div>
                    <span className="mj-review-badge" style={{ marginTop: 12 }}>
                      BIG-geregistreerd
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 11. Reviews */}
      <section
        id="recensies"
        style={{
          padding: "var(--section-pad-y) var(--gutter)",
          maxWidth: "var(--content-max-editorial)",
          margin: "0 auto",
          scrollMarginTop: 88,
        }}
      >
        <Reveal>
          <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", margin: "0 0 12px", color: "var(--color-text)" }}>
            Resultaten die spreken
          </h2>
          <p style={{ fontSize: "var(--fs-body-lg)", color: "var(--color-text-soft)", margin: "0 0 48px", lineHeight: "var(--lh-body)" }}>
            Echte trajecten van patiënten die met medische begeleiding zijn
            gestart. Individuele resultaten kunnen variëren.
          </p>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {REVIEWS.map((r, i) => {
              const text = (
                <div className="mj-review-text" key="text">
                  <div className="mj-hero-stars" style={{ fontSize: 14, marginBottom: 16 }}>
                    ★★★★★
                  </div>
                  <div className="mj-review-quote">{r.quote}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>
                    {r.name}
                  </div>
                  <span className="mj-review-badge">{r.result}</span>
                </div>
              );
              const image = (
                <div key="img" className="mj-review-media">
                  <div className="mj-review-pair">
                    <Image
                      src={r.before}
                      alt={`${r.alt}, voor`}
                      width={564}
                      height={800}
                      className="mj-photo"
                    />
                    <Image
                      src={r.after}
                      alt={`${r.alt}, na`}
                      width={564}
                      height={800}
                      className="mj-photo"
                    />
                  </div>
                  <div className="mj-review-labels">
                    <span>Voor</span>
                    <span>Na</span>
                  </div>
                </div>
              );
              return (
                <Reveal
                  key={r.name}
                  delay={i * 80}
                  variant={r.flip ? "right" : "left"}
                >
                  <div className="mj-review-card">
                    <div
                      className={
                        r.flip ? "mj-review-row-flip mj-review-row" : "mj-review-row"
                      }
                    >
                      {r.flip ? [text, image] : [image, text]}
                    </div>
                  </div>
                </Reveal>
              );
            })}
        </div>
      </section>

      {/* 12. FAQ */}
      <section style={{ background: "var(--white)", padding: "var(--section-pad-y) var(--gutter)" }}>
        <Reveal>
          <div style={{ maxWidth: "var(--content-max-editorial)", margin: "0 auto" }}>
            <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", margin: "0 0 24px", color: "var(--color-text)" }}>
              Jouw vragen beantwoord
            </h2>
            <FaqAccordion items={MJ_FAQ} />
          </div>
        </Reveal>
      </section>

      {/* 13. Final CTA */}
      <section style={{ padding: "var(--section-pad-y) var(--gutter)" }}>
        <Reveal variant="scale">
          <div className="mj-final-cta mj-panel-deep">
            <h2 className="mj-serif" style={{ fontSize: "var(--fs-h2)", margin: "0 auto 16px", maxWidth: 640 }}>
              Sluit je aan bij duizenden mensen die afvallen met {MJ_BRAND_NAME}
            </h2>
            <p style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-body)", margin: "0 auto 32px", maxWidth: 520 }}>
              Vul de vragenlijst in. Binnen 24 uur beoordeelt een BIG-geregistreerde
              zorgverlener of de behandeling bij je past.
            </p>
            <a href="/winkel" className="mj-btn mj-btn-primary mj-btn-lg">
              Kom ik in aanmerking?
            </a>
            <ul className="mj-check-inline" style={{ marginTop: 32 }}>
              <li>Geen abonnement</li>
              <li>Gratis discrete levering</li>
              <li>Nederlandse artsen</li>
            </ul>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
