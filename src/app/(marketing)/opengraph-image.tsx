import { renderClinicOgImage } from "@/lib/mj/og-image";

export const runtime = "edge";
export const alt = "The Clinic — Medisch gewichtsverlies met Mounjaro en Ozempic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderClinicOgImage({
    title: "Medisch gewichtsverlies",
    subtitle:
      "Mounjaro en Ozempic, voorgeschreven door Nederlandse artsen. Start online, discreet thuisbezorgd.",
    bullets: ["Klinisch bewezen", "Gratis discrete levering"],
  });
}
