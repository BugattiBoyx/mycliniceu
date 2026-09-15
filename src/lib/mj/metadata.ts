import type { Metadata } from "next";

export const MJ_SITE_NAME = "The Clinic";

export const MJ_DEFAULT_TITLE =
  "The Clinic - Wetenschappelijk bewezen afslankbehandelingen";

export const MJ_DEFAULT_DESCRIPTION =
  "Online kliniek voor gewichtsverlies. Mounjaro en Ozempic, voorgeschreven door BIG-geregistreerde Nederlandse artsen. Gratis discrete levering.";

/** Canonical storefront origin — required for absolute og:image URLs in chat apps. */
export function getMjSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://thecliniceu.com";
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

type MjPageMetaInput = {
  title?: string;
  description?: string;
  path?: string;
};

/** Shared Open Graph + Twitter metadata for The Clinic storefront pages. */
export function buildMjMetadata({
  title,
  description = MJ_DEFAULT_DESCRIPTION,
  path = "/",
}: MjPageMetaInput = {}): Metadata {
  const resolvedTitle = title ?? MJ_DEFAULT_TITLE;
  const url = path.startsWith("http") ? path : `${getMjSiteUrl()}${path}`;

  return {
    metadataBase: new URL(getMjSiteUrl()),
    title: title
      ? { absolute: `${title} - ${MJ_SITE_NAME}` }
      : { absolute: MJ_DEFAULT_TITLE },
    description,
    alternates: {
      canonical: path.startsWith("http") ? path : path,
    },
    openGraph: {
      type: "website",
      locale: "nl_NL",
      siteName: MJ_SITE_NAME,
      title: resolvedTitle,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
    },
    icons: {
      icon: "/brand/favicon.png",
      apple: "/brand/favicon.png",
    },
  };
}

export const mjRootMetadata: Metadata = buildMjMetadata();
