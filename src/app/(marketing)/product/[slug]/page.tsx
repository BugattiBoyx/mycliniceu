import { redirect } from "next/navigation";

export default async function ProductRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug.includes("mounjaro")) redirect("/winkel/mounjaro");
  if (slug.includes("ozempic")) redirect("/winkel/ozempic");
  redirect("/winkel");
}
