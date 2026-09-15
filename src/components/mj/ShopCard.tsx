"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MjProductImage, useMjProduct } from "@/components/mj/Catalog";
import { getDosage, type MjProductKey } from "@/lib/mj/data";
import { useMjStore } from "@/lib/mj/store";
import { PriceDisplay, WishlistButton } from "./ui";

const CARD_FLAG: Record<MjProductKey, string> = {
  mounjaro: "Meest gekozen",
  ozempic: "Klinisch bewezen",
};

export function ShopCard({ productKey }: { productKey: MjProductKey }) {
  const router = useRouter();
  const product = useMjProduct(productKey);
  const { toggleWishlist, isWishlisted } = useMjStore();
  const dosage = getDosage(product, product.defaultMg);
  const href = `/winkel/${productKey}`;
  const lowest = product.dosages.reduce(
    (min, d) => (d.now < min.now ? d : min),
    product.dosages[0],
  );

  return (
    <div className="mj-pcard mj-card-hover">
      <Link
        href={href}
        className={`mj-pcard-media mj-product-stage${productKey === "ozempic" ? " mj-product-stage-oz" : ""}`}
        aria-label={product.cardTitle}
      >
        <span className="mj-pcard-flag">{CARD_FLAG[productKey]}</span>
        <MjProductImage
          src={product.image}
          alt={product.cardTitle}
          width={720}
          height={540}
        />
      </Link>
      <div className="mj-pcard-body">
        <div className="mj-eyebrow">
          {product.name} · vanaf {lowest.mgLabel} mg
        </div>
        <Link href={href} className="mj-pcard-title">
          {product.cardTitle}
        </Link>
        <ul className="mj-check-inline">
          {product.bullets.slice(0, 3).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <PriceDisplay now={dosage.now} was={dosage.was} size="md" />
        <div className="mj-pcard-actions">
          <button
            type="button"
            className="mj-btn mj-btn-primary"
            onClick={() => router.push(href)}
          >
            Bekijk behandeling
          </button>
          <WishlistButton
            active={isWishlisted(productKey)}
            onClick={() => toggleWishlist(productKey)}
          />
        </div>
      </div>
    </div>
  );
}
