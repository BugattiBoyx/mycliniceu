"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import { MJ_PRODUCTS, type MjProductKey } from "@/lib/mj/data";
import type { MjProductView } from "@/lib/mj/catalog";

const CatalogContext = createContext<Record<MjProductKey, MjProductView>>({
  mounjaro: { ...MJ_PRODUCTS.mounjaro, gallery: [] },
  ozempic: { ...MJ_PRODUCTS.ozempic, gallery: [] },
});

export function MjCatalogProvider({
  catalog,
  children,
}: {
  catalog: Record<MjProductKey, MjProductView>;
  children: ReactNode;
}) {
  return (
    <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
  );
}

export function useMjCatalog() {
  return useContext(CatalogContext);
}

export function useMjProduct(key: MjProductKey): MjProductView {
  return useMjCatalog()[key];
}

/** Renders static theme assets via next/image; uploads/remote/data via <img>. */
export function MjProductImage({
  src,
  alt,
  width,
  height,
  priority,
  fill,
  className,
  style,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const dynamic =
    src.startsWith("http") ||
    src.startsWith("data:") ||
    src.startsWith("/uploads/");

  if (dynamic) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: fill ? "100%" : style?.width ?? "100%",
          height: fill ? "100%" : style?.height ?? "auto",
          objectFit: (style?.objectFit as CSSProperties["objectFit"]) || "contain",
          display: "block",
          ...style,
        }}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 640}
      height={height || 480}
      priority={priority}
      className={className}
      style={style}
    />
  );
}
