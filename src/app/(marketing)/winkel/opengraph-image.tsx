import { renderClinicOgImage } from "@/lib/mj/og-image";

export const runtime = "edge";
export const alt = "The Clinic — Mounjaro en Ozempic behandelingen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderClinicOgImage({
    title: "Onze behandelingen",
    subtitle:
      "Mounjaro en Ozempic injectiepen. Kies de juiste sterkte en bestel direct online.",
    bullets: ["Mounjaro & Ozempic", "Op recept"],
    productImagePath: "/products/ozempic-vs-mounjaro.png",
  });
}
