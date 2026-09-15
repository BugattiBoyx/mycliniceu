import { prisma } from "@/lib/db";
import {
  MJ_PRODUCTS,
  type MjDosage,
  type MjProduct,
  type MjProductKey,
} from "@/lib/mj/data";

export type MjProductView = MjProduct & {
  gallery: string[];
};

function parseGallery(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function keyFromSlugOrName(slug: string, name: string): MjProductKey | null {
  const hay = `${slug} ${name}`.toLowerCase();
  if (hay.includes("mounjaro")) return "mounjaro";
  if (hay.includes("ozempic")) return "ozempic";
  return null;
}

function mergeDosages(
  base: MjDosage[],
  variants: { label: string; price: number; compareAt: number | null }[],
): MjDosage[] {
  if (!variants.length) return base;
  return base.map((d) => {
    const match = variants.find((v) => {
      const label = v.label.toLowerCase().replace(/\s+/g, "");
      const mg = d.mg.toLowerCase();
      const mgLabel = d.mgLabel.toLowerCase().replace(",", ".");
      return (
        label.includes(mg) ||
        label.includes(mgLabel) ||
        label === d.variantLabel.toLowerCase().replace(/\s+/g, "")
      );
    });
    if (!match) return d;
    return {
      ...d,
      now: match.price,
      was: match.compareAt ?? d.was,
    };
  });
}

/** Live catalog for the MJ storefront — DB overrides static theme defaults. */
export async function getMjCatalog(): Promise<Record<MjProductKey, MjProductView>> {
  const base: Record<MjProductKey, MjProductView> = {
    mounjaro: { ...MJ_PRODUCTS.mounjaro, gallery: [] },
    ozempic: { ...MJ_PRODUCTS.ozempic, gallery: [] },
  };

  try {
    const store =
      (await prisma.store.findFirst({
        where: { slug: "moun-journey" },
      })) ||
      (await prisma.store.findFirst({
        where: { isPrimary: true },
      })) ||
      (await prisma.store.findFirst({ orderBy: { createdAt: "asc" } }));

    if (!store) return base;

    const products = await prisma.product.findMany({
      where: { storeId: store.id, status: "active" },
      include: { variants: true },
    });

    for (const p of products) {
      const key =
        keyFromSlugOrName(p.slug, p.name) ||
        (Object.keys(MJ_PRODUCTS) as MjProductKey[]).find(
          (k) => MJ_PRODUCTS[k].slug === p.slug,
        );
      if (!key) continue;

      const fallback = base[key];
      const gallery = parseGallery(p.galleryUrls);
      base[key] = {
        ...fallback,
        name: p.name.replace(/\s+kopen$/i, "").trim() || fallback.name,
        pageTitle: p.name || fallback.pageTitle,
        cardTitle: p.name.replace(/\s+kopen$/i, "").trim() || fallback.cardTitle,
        description: p.description || fallback.description,
        // Storefront product shots are flattened onto #ffffff. Do not let a
        // CMS/DB URL (studio gray JPEG, upload, etc.) replace them.
        image: fallback.image,
        gallery,
        dosages: mergeDosages(fallback.dosages, p.variants),
      };
    }
  } catch {
    // DB unavailable during build — keep static defaults
  }

  return base;
}

export async function getMjProductLive(
  key: string,
): Promise<MjProductView | undefined> {
  if (key !== "mounjaro" && key !== "ozempic") return undefined;
  const catalog = await getMjCatalog();
  return catalog[key];
}
