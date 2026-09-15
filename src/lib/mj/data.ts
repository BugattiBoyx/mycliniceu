// Storefront product data, copy and config.
// Prices mirror the database seed (source of truth at checkout is the DB).

import { MJ_BRAND_NAME, mjWhatsAppMessage } from "@/lib/mj/brand";

export type MjProductKey = "mounjaro" | "ozempic";

export type MjDosage = {
  mg: string; // "7.5"
  mgLabel: string; // "7,5"
  variantLabel: string; // DB variant label "7.5 MG"
  was: number;
  now: number;
};

export type MjProduct = {
  key: MjProductKey;
  name: string; // "Mounjaro"
  slug: string; // DB product slug
  cardTitle: string; // "Mounjaro Injectiepen"
  pageTitle: string; // "Mounjaro Injectiepen kopen"
  description: string;
  bullets: string[];
  image: string;
  defaultMg: string;
  dosages: MjDosage[];
};

export const MJ_PRODUCTS: Record<MjProductKey, MjProduct> = {
  mounjaro: {
    key: "mounjaro",
    name: "Mounjaro",
    slug: "mounjaro-injectiepen-kopen",
    cardTitle: "Mounjaro Injectiepen",
    pageTitle: "Mounjaro Injectiepen kopen",
    description:
      "Wekelijkse voorgevulde pen met tirzepatide. Helpt volwassenen met overgewicht om te verliezen. Alleen op recept.",
    bullets: [
      "1x per week",
      "Voorgevuld, eenmalig gebruik",
      "Subcutaan: buik, dij of bovenarm",
    ],
    image: "/products/mounjaro-pens-transparent.png",
    defaultMg: "7.5",
    dosages: [
      { mg: "2.5", mgLabel: "2,5", variantLabel: "2.5 MG", was: 270, now: 200 },
      { mg: "5", mgLabel: "5", variantLabel: "5 MG", was: 320, now: 250 },
      { mg: "7.5", mgLabel: "7,5", variantLabel: "7.5 MG", was: 390, now: 320 },
      { mg: "10", mgLabel: "10", variantLabel: "10 MG", was: 420, now: 350 },
      {
        mg: "12.5",
        mgLabel: "12,5",
        variantLabel: "12.5 MG",
        was: 470,
        now: 400,
      },
      { mg: "15", mgLabel: "15", variantLabel: "15 MG", was: 480, now: 410 },
    ],
  },
  ozempic: {
    key: "ozempic",
    name: "Ozempic",
    slug: "ozempic-injectiepen-kopen",
    cardTitle: "Ozempic Injectiepen",
    pageTitle: "Ozempic Injectiepen kopen",
    description:
      "Wekelijkse voorgevulde pen met semaglutide. Helpt volwassenen met overgewicht om te verliezen. Alleen op recept.",
    bullets: [
      "1x per week",
      "Voorgevuld, eenmalig gebruik",
      "Subcutaan: buik, dij of bovenarm",
    ],
    image: "/products/ozempic-pens-transparent.png",
    defaultMg: "1.0",
    dosages: [
      { mg: "1.0", mgLabel: "1,0", variantLabel: "1.0 MG", was: 249, now: 179 },
      { mg: "2.0", mgLabel: "2,0", variantLabel: "2.0 MG", was: 390, now: 320 },
    ],
  },
};

export function getMjProduct(key: string): MjProduct | undefined {
  return key === "mounjaro" || key === "ozempic" ? MJ_PRODUCTS[key] : undefined;
}

export function getDosage(product: MjProduct, mg: string): MjDosage {
  return product.dosages.find((d) => d.mg === mg) ?? product.dosages[0];
}

/** "€ 320,00" — matches the design's price formatting. */
export function mjPrice(n: number) {
  return `€ ${n.toFixed(2).replace(".", ",")}`;
}

export const WHATSAPP_DISPLAY = "+31 6 16739498";
export const WHATSAPP_DIGITS = "31616739498";
export const WHATSAPP_DEFAULT_MESSAGE = mjWhatsAppMessage();

export function getWhatsAppUrl(message?: string) {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(message || WHATSAPP_DEFAULT_MESSAGE)}`;
}

export const MJ_FAQ = [
  {
    q: "Wat wordt besproken tijdens het online consult?",
    a: "Tijdens ons online consult via een vragenlijst komen je levensstijl, medische geschiedenis, gewicht en eventuele medicatie die je momenteel gebruikt aan bod. Deze informatie stelt onze zorgverleners in staat om te bepalen welke behandeling geschikt is voor jou.",
  },
  {
    q: `Voor wie is het ${MJ_BRAND_NAME}-Afslankprogramma geschikt?`,
    a: "Het Afslankprogramma is bedoeld om mensen die overgewicht of obesitas hebben te helpen een gezonder gewicht te bereiken. Onze zorgverleners beoordelen je geschiktheid individueel en op basis van je specifieke situatie.",
  },
  {
    q: "Zijn afslankmedicijnen veilig voor langdurig gebruik?",
    a: "Al onze medicijnen zijn grondig onderzocht en gebaseerd op wetenschappelijk bewijs. Onze zorgverleners werken met jou samen om de optimale duur van het gebruik te bepalen, gebaseerd op jouw persoonlijke omstandigheden.",
  },
  {
    q: "Wat zijn de mogelijke bijwerkingen van GLP-1 medicatie?",
    a: "De meest voorkomende bijwerkingen zijn gastro-intestinaal en omvatten misselijkheid, diarree, maagpijn en constipatie. Deze nemen gewoonlijk af naarmate je lichaam zich aanpast. Lees altijd de bijsluiter voor de volledige lijst.",
  },
  {
    q: "Kan ik Ozempic of Mounjaro online kopen?",
    a: "Ja, je bestelt direct online. Mits je in aanmerking komt, ontvang je een recept via een van onze gecertificeerde medische experts.",
  },
];

export type MjProductEducation = {
  timingTitle: string;
  timingBody: string[];
  summaryTitle: string;
  summaryRows: { label: string; value: string }[];
  efficacyTitle: string;
  efficacyIntro: string;
  efficacyHighlight: string;
  efficacyMilestones: string[];
  efficacyFactorsTitle: string;
  efficacyFactors: string[];
  efficacyChartNote: string;
  efficacyBars: { label: string; pct: number; color: string }[];
  disclaimer: string;
};

export const MJ_PRODUCT_EDUCATION: Partial<
  Record<MjProductKey, MjProductEducation>
> = {
  mounjaro: {
    timingTitle: "Hoe lang duurt het voordat Mounjaro werkt?",
    timingBody: [
      "Mounjaro begint te werken na de eerste injectie, maar merkbare gewichtsafname bouwt zich meestal op over weken, naarmate de dosis stapsgewijs wordt verhoogd onder medische begeleiding.",
      "Veel mensen merken al in de eerste week minder eetlust. Stabiele resultaten volgen wanneer dosering, voeding en beweging samen worden opgepakt.",
    ],
    summaryTitle: "Mounjaro KwikPen samenvatting",
    summaryRows: [
      { label: "Doseerfrequentie", value: "1× per week injectie" },
      {
        label: "Werkzame stof",
        value: "Tirzepatide",
      },
      {
        label: "Geneesmiddelklasse",
        value: "GLP-1- en GIP-receptoragonist",
      },
      {
        label: "Werking",
        value:
          "Werkt als eetlustremmer door hormonen na te bootsen die een vol gevoel geven. Beïnvloedt ook het metabolisme en de energiebalans.",
      },
      {
        label: "Maximaal gewichtsverlies*",
        value: "Tot 22,5% na 17 maanden",
      },
      {
        label: "Beschikbare sterktes",
        value: "2,5 mg, 5 mg, 7,5 mg, 10 mg, 12,5 mg & 15 mg",
      },
    ],
    efficacyTitle: "Hoe effectief is Mounjaro?",
    efficacyIntro:
      "In combinatie met een caloriearm dieet en meer beweging ondersteunt Mounjaro gewichtsverlies. In klinisch onderzoek verloren deelnemers op 15 mg gemiddeld",
    efficacyHighlight: "22,5% van hun startgewicht over 72 weken",
    efficacyMilestones: [
      "96,3% verloor minstens 5%",
      "90,1% verloor minstens 10%",
      "78,2% verloor minstens 15%",
      "62,9% verloor minstens 20%",
    ],
    efficacyFactorsTitle:
      "Jouw resultaat hangt onder meer af van:",
    efficacyFactors: [
      "Startgewicht",
      "Dosering",
      "Voeding",
      "Lichaamsbeweging",
      "Algemene gezondheid",
    ],
    efficacyChartNote:
      "Gemiddeld gewichtsverlies per dosis na 72 weken in onderzoek:",
    efficacyBars: [
      { label: "5 mg", pct: 16, color: "var(--pine-400)" },
      { label: "10 mg", pct: 21.4, color: "var(--pine-700)" },
      { label: "15 mg", pct: 22.5, color: "var(--pine-900)" },
      { label: "Placebo", pct: 2.4, color: "var(--color-text-muted)" },
    ],
    disclaimer:
      "Individuele resultaten verschillen. Gegevens gebaseerd op gepubliceerd klinisch onderzoek naar tirzepatide. Mounjaro is alleen op recept en na beoordeling door een arts. Lees altijd de bijsluiter.",
  },
  ozempic: {
    timingTitle: "Hoe lang duurt het voordat Ozempic werkt?",
    timingBody: [
      "Ozempic begint na de eerste injectie te werken. Merkbare gewichtsafname zie je meestal over weken, terwijl de dosis onder begeleiding van een arts wordt opgebouwd.",
      "Verminderde eetlust merken veel mensen al vroeg. Duurzame resultaten volgen bij een stabiele dosering, gezonde voeding en voldoende beweging.",
    ],
    summaryTitle: "Ozempic injectiepen samenvatting",
    summaryRows: [
      { label: "Doseerfrequentie", value: "1× per week injectie" },
      { label: "Werkzame stof", value: "Semaglutide" },
      {
        label: "Geneesmiddelklasse",
        value: "GLP-1-receptoragonist",
      },
      {
        label: "Werking",
        value:
          "Vermindert eetlust en vertraagt de maaglediging, zodat je langer een vol gevoel houdt. Ondersteunt zo gewichtsverlies naast leefstijlaanpassingen.",
      },
      {
        label: "Gewichtsverlies in onderzoek*",
        value: "Gemiddeld tot ca. 15% bij hogere doseringen",
      },
      {
        label: "Beschikbare sterktes",
        value: "1,0 mg & 2,0 mg",
      },
    ],
    efficacyTitle: "Hoe effectief is Ozempic?",
    efficacyIntro:
      "Samen met dieet en beweging ondersteunt Ozempic gewichtsverlies. In studies met semaglutide zagen deelnemers gemiddeld tot ongeveer",
    efficacyHighlight: "15% gewichtsverlies bij hogere doseringen",
    efficacyMilestones: [
      "Grote meerderheid verloor minstens 5%",
      "Veel deelnemers verloor minstens 10%",
      "Resultaten bouwen op over maanden",
      "Begeleiding door een arts is essentieel",
    ],
    efficacyFactorsTitle: "Jouw resultaat hangt onder meer af van:",
    efficacyFactors: [
      "Startgewicht",
      "Dosering",
      "Voeding",
      "Lichaamsbeweging",
      "Algemene gezondheid",
    ],
    efficacyChartNote: "Indicatief gemiddeld gewichtsverlies per dosis:",
    efficacyBars: [
      { label: "1,0 mg", pct: 12, color: "var(--pine-400)" },
      { label: "2,0 mg", pct: 15, color: "var(--pine-900)" },
      { label: "Placebo", pct: 2.5, color: "var(--color-text-muted)" },
    ],
    disclaimer:
      "Individuele resultaten verschillen. Gegevens gebaseerd op gepubliceerd onderzoek naar semaglutide. Ozempic is alleen op recept en na beoordeling door een arts. Lees altijd de bijsluiter.",
  },
};
