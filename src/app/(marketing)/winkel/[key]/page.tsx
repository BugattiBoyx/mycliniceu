import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/mj/ProductDetail";
import { getMjProduct } from "@/lib/mj/data";
import { buildMjMetadata } from "@/lib/mj/metadata";

export function generateStaticParams() {
  return [{ key: "mounjaro" }, { key: "ozempic" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const product = getMjProduct(key);
  if (!product) return {};
  return buildMjMetadata({
    title: product.pageTitle,
    description: product.description,
    path: `/winkel/${product.key}`,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const product = getMjProduct(key);
  if (!product) notFound();
  return <ProductDetail productKey={product.key} />;
}
