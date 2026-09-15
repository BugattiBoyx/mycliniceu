import { notFound } from "next/navigation";
import { getMjProduct, mjPrice } from "@/lib/mj/data";
import { renderClinicOgImage } from "@/lib/mj/og-image";

export const runtime = "edge";
export const alt = "The Clinic product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const product = getMjProduct(key);
  if (!product) notFound();

  const startPrice = Math.min(...product.dosages.map((d) => d.now));

  return renderClinicOgImage({
    eyebrow: `${product.name} · op recept`,
    title: product.cardTitle,
    subtitle: product.description,
    bullets: [`Vanaf ${mjPrice(startPrice)}`, "Discrete levering"],
    productImagePath: product.image,
    badge: product.key === "mounjaro" ? "Meest gekozen" : "Klinisch bewezen",
  });
}
