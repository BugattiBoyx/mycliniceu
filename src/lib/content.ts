import { MJ_BRAND_EMAIL, MJ_BRAND_NAME, MJ_COPYRIGHT } from "@/lib/mj/brand";

export const site = {
  name: MJ_BRAND_NAME,
  email: MJ_BRAND_EMAIL,
  address: "Amsterdam, The Netherlands",
  fromPrice: 179,
  oldPrice: 249,
  copyright: MJ_COPYRIGHT.replace("Copyright ", "© "),
};

export const hero = {
  title: "Wetenschappelijk bewezen behandelingen voor gewichtsverlies",
  body: "Bereik een gezond gewicht met medicatie ondersteund door wetenschap. Samengesteld door artsen en voedingsdeskundigen.",
  checks: [
    "In Nederland geregistreerde medicijnen",
    "Voorgeschreven door Nederlandse artsen",
    "Medische ondersteuning gedurende het traject",
  ],
};

export const glpBenefits = [
  "Vermindert honger en calorieopname.",
  "Klinisch bewezen afslankmedicatie.",
  "Verlies tot 10-22% lichaamsgewicht.*",
];

export const steps = [
  {
    n: "1",
    title: "Vul de online vragenlijst in slechts 5 minuten in",
    body: "Deel je medische geschiedenis en gewichtsverloop met ons, zodat we de beste behandeling voor jou kunnen bepalen.",
  },
  {
    n: "2",
    title: "Ontvang een behandelplan en recept",
    body: "Indien je in aanmerking komt, zal jouw arts een geschikt medicijn voorschrijven, zoals een GLP-1 medicatie.",
  },
  {
    n: "3",
    title: "Ontvang jouw producten aan huis",
    body: "Ontvang jouw voorgeschreven medicatie binnen 2 werkdagen* aan huis via partnerapotheek.",
  },
  {
    n: "4",
    title: "Start jouw programma",
    body: "Onze artsen en coaches begeleiden en ondersteunen je gedurende het hele traject.",
  },
];

export const planPoints = [
  "Afslankmedicatie (incl. voorschrift & verzending)",
  "Persoonlijke begeleiding door artsen en gewichtsverliesexperts",
  "Vermindert honger en calorieopname",
  "Verlies tot 10-22% lichaamsgewicht.*",
  "Maandelijks kosteloos opzegbaar",
];

export const trustCards = [
  {
    title: "Klinische ondersteuning",
    body: "Overal en altijd toegang tot artsen en medisch advies.",
  },
  {
    title: "Gratis, discrete levering",
    body: "Eenvoudig en snel aan huis. Volledig discreet en kosteloos.",
  },
  {
    title: "Volledige controle",
    body: "Eenvoudig pauzeren of kosteloos annuleren.",
  },
  {
    title: "Nederlandse experts",
    body: "Aangeboden door Nederlandse artsen en apothekers",
  },
];

export const stats = [
  {
    value: "10-22%",
    label: "verlies van lichaamsgewicht",
    body: "Gemiddeld gewichtsverlies bij gebruik van GLP1-medicatie.*",
  },
  {
    value: "97%",
    label: "verbeterd zelfvertrouwen",
    body: "97% van de patiënten voelt zich zelfverzekerder na het programma.",
  },
  {
    value: "97%",
    label: "verbeterd algemene gezondheid",
    body: "97% van de patiënten voelt een verbetering van de algehele gezondheid na het programma.",
  },
];

export const pillars = [
  {
    title: "Artsenvertrouwde behandelingen",
    body: "Ontvang onderzochte, klinisch bewezen behandelingen eenvoudig van thuis.",
  },
  {
    title: "Gepersonaliseerde aanbeveling",
    body: "Jouw toegewezen medische arts zal een behandeling aanbevelen op basis van jouw persoonlijke behoeften.",
  },
  {
    title: "Erkende fabrikanten",
    body: "Authentieke, onderzochte en veilige producten die voldoen aan strenge kwaliteitsnormen.",
  },
  {
    title: "25.000+ consultaties",
    body: `${MJ_BRAND_NAME} heeft meer dan 25.000 online medische consultaties verzorgd*.`,
  },
];

export const experts = [
  { name: "Mark van Dijk", role: "Hoofd Apotheker" },
  { name: "Marieke Jansen", role: "Huisarts" },
];

export const testimonials = [
  {
    quote:
      "Ik heb het gevoel dat ik een langer, gelukkiger leven kan leiden met minder risico op hart- en vaatziekten. Ik heb vele jaren geworsteld met overgewicht, dus de impact is levensveranderend geweest.",
    name: "Julia, 64",
    result: "-12 kg in 4 maanden",
    before: "/reviews/julia_before.webp",
    after: "/reviews/julia_after.webp",
  },
  {
    quote:
      "Ik ontdekte een oude tas met kleren en kon niet geloven hoeveel ervan mij pasten waar ik eerder geen kans had gehad. Ik voel me geweldig.",
    name: "Andy, 55",
    result: "-6kg in 7 weken",
    before: "/reviews/andy_before.webp",
    after: "/reviews/andy_after.webp",
  },
  {
    quote:
      "Er is dit jaar een enorme verandering geweest. Ik voel me een ander persoon. Ik zie mezelf meer lachen en ik heb niemand nodig die me vertelt dat ik mooi ben.",
    name: "Emma, 47",
    result: "-9,5kg in 7 maanden",
    before: "/reviews/emma_before.webp",
    after: "/reviews/emma_after.webp",
  },
];

export const faqs = [
  {
    q: "Wat wordt besproken tijdens het online consult?",
    a: "Tijdens ons online consult via een vragenlijst komen je levensstijl, medische geschiedenis, gewicht en eventuele medicatie die je momenteel gebruikt aan bod. Het invullen hiervan zou slechts enkele minuten moeten duren.",
  },
  {
    q: `Voor wie is het ${MJ_BRAND_NAME}-Afslankprogramma geschikt?`,
    a: "Het Afslankprogramma is bedoeld om mensen die overgewicht of obesitas hebben te helpen een gezonder gewicht te bereiken. Onze zorgverleners beoordelen je geschiktheid individueel.",
  },
  {
    q: "Zijn afslankmedicijnen veilig voor langdurig gebruik?",
    a: "Al onze medicijnen zijn grondig onderzocht en gebaseerd op wetenschappelijk bewijs. Semaglutide is goedgekeurd voor de langdurige behandeling van obesitas. Onze zorgverleners bepalen samen met jou de optimale duur.",
  },
  {
    q: "Wat zijn de mogelijke bijwerkingen van GLP-1 medicatie zoals Saxenda of Ozempic?",
    a: "De meest voorkomende bijwerkingen zijn gastro-intestinaal en omvatten misselijkheid, diarree, maagpijn en constipatie. Deze nemen gewoonlijk af naarmate je lichaam zich aanpast. Lees altijd de bijsluiter.",
  },
  {
    q: "Kan ik Saxenda of Ozempic online kopen?",
    a: `Je kunt GLP-1 medicijnen voor gewichtsverlies kopen bij ${MJ_BRAND_NAME}, mits je in aanmerking komt. Vul de online vragenlijst in om te zien welke behandeling geschikt is voor jou.`,
  },
];
