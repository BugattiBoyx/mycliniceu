export type ProductVariant = {
  id: string;
  label: string;
  mg: string;
  price: number;
  image: string;
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  bullets: string[];
  category: string;
  images: string[];
  variants: ProductVariant[];
  rating?: number;
  reviewCount?: number;
};

export const products: Product[] = [
  {
    id: "990",
    slug: "mounjaro-injectiepen-kopen",
    name: "Mounjaro Injectiepen kopen",
    shortName: "Mounjaro",
    tagline: "Wekelijkse voorgevulde pen met tirzepatide.",
    description:
      "Mounjaro: Wekelijkse voorgevulde pen met tirzepatide. Helpt volwassenen met type 2-diabetes hun glucose te verlagen. Alleen op recept.",
    bullets: [
      "1x per week",
      "Voorgevuld, eenmalig gebruik",
      "Meerdere sterktes: 2.5–15 mg",
      "Subcutaan: buik, dij of bovenarm",
      "Bewijs: GLP-1 + GIP receptor-agonist",
    ],
    category: "Mounjaro",
    images: ["/products/mounjaro.png", "/products/mounjaro-banner.webp"],
    rating: 5,
    reviewCount: 1,
    variants: [
      { id: "1005", label: "2.5 MG", mg: "2-5-mg", price: 200, image: "/products/mounjaro.png", inStock: true },
      { id: "1006", label: "5 MG", mg: "5-mg", price: 250, image: "/products/mounjaro.png", inStock: true },
      { id: "1007", label: "7.5 MG", mg: "7-5-mg", price: 320, image: "/products/mounjaro.png", inStock: true },
      { id: "1002", label: "10 MG", mg: "10-mg", price: 350, image: "/products/mounjaro.png", inStock: true },
      { id: "1003", label: "12.5 MG", mg: "12-5-mg", price: 400, image: "/products/mounjaro.png", inStock: true },
      { id: "1004", label: "15 MG", mg: "15-mg", price: 410, image: "/products/mounjaro.png", inStock: true },
    ],
  },
  {
    id: "1116",
    slug: "ozempic-injectiepen-kopen",
    name: "Ozempic Injectiepen kopen",
    shortName: "Ozempic",
    tagline: "Wekelijkse voorgevulde pen met semaglutide.",
    description:
      "Ozempic: Wekelijkse voorgevulde pen voor glucosecontrole en ondersteuning bij gewichtsverlies. Alleen op recept.",
    bullets: [
      "1x per week",
      "Voorgevuld, eenmalig gebruik",
      "Sterktes: 1.0 mg en 2.0 mg",
      "Subcutaan: buik, dij of bovenarm",
      "GLP-1 receptor-agonist",
    ],
    category: "Mounjaro",
    images: ["/products/ozempic.png", "/products/mounjaro-banner.webp"],
    variants: [
      { id: "1343", label: "1.0 MG", mg: "1-0-mg", price: 179, image: "/products/ozempic.png", inStock: true },
      { id: "1344", label: "2.0 MG", mg: "2-0-mg", price: 320, image: "/products/ozempic.png", inStock: true },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatEuro(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
