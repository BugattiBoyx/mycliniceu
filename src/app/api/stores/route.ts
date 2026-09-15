import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTemplateAsync, isValidTemplateId } from "@/lib/templates-server";
import { slugify } from "@/lib/tenancy";

async function seedMounJourneyCatalog(storeId: string) {
  const category = await prisma.category.create({
    data: { name: "Treatments", slug: "treatments", storeId },
  });
  await prisma.product.create({
    data: {
      name: "Mounjaro Injectiepen kopen",
      slug: "mounjaro-injectiepen-kopen",
      description: "Wekelijkse voorgevulde pen met tirzepatide. Alleen op recept.",
      imageUrl: "/products/mounjaro.png",
      storeId,
      categoryId: category.id,
      variants: {
        create: [
          { label: "2.5 MG", price: 200 },
          { label: "5 MG", price: 250 },
          { label: "7.5 MG", price: 320 },
          { label: "10 MG", price: 350 },
          { label: "12.5 MG", price: 400 },
          { label: "15 MG", price: 410 },
        ],
      },
    },
  });
  await prisma.product.create({
    data: {
      name: "Ozempic Injectiepen kopen",
      slug: "ozempic-injectiepen-kopen",
      description: "Wekelijkse voorgevulde pen met semaglutide. Alleen op recept.",
      imageUrl: "/products/ozempic.png",
      storeId,
      categoryId: category.id,
      variants: {
        create: [
          { label: "1.0 MG", price: 179 },
          { label: "2.0 MG", price: 320 },
        ],
      },
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const name = String(body.name || "").trim();
  let subdomain = slugify(String(body.subdomain || name));
  const templateId = String(body.templateId || "");
  if (!name || !subdomain) {
    return NextResponse.json({ error: "Name and subdomain required" }, { status: 400 });
  }
  if (!(await isValidTemplateId(templateId))) {
    return NextResponse.json(
      { error: "Select a valid template" },
      { status: 400 },
    );
  }
  const template = await getTemplateAsync(templateId);

  const taken = await prisma.store.findFirst({
    where: { OR: [{ subdomain }, { slug: subdomain }] },
  });
  if (taken) {
    subdomain = `${subdomain}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const count = await prisma.storeMember.count({ where: { userId: session.user.id } });

  const store = await prisma.store.create({
    data: {
      name,
      slug: subdomain,
      subdomain,
      templateId: template.id,
      status: "live",
      isPrimary: count === 0,
      previewImage: template.preview,
      tagline: "Wetenschappelijk bewezen behandelingen voor gewichtsverlies",
      brandColor: "#004751",
      members: { create: { userId: session.user.id, role: "owner" } },
      domains: {
        create: {
          hostname: `${subdomain}.localhost`,
          verified: true,
          isPrimary: true,
        },
      },
    },
  });

  if (templateId === "moun-journey") {
    await seedMounJourneyCatalog(store.id);
  }

  return NextResponse.json({ id: store.id, subdomain: store.subdomain });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const action = String(body.action || "");

  const membership = await prisma.storeMember.findFirst({
    where: { storeId, userId: session.user.id },
    include: { store: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "publish") {
    await prisma.store.update({ where: { id: storeId }, data: { status: "live" } });
  } else if (action === "unpublish") {
    await prisma.store.update({ where: { id: storeId }, data: { status: "draft" } });
  } else if (action === "setTemplate") {
    const templateId = String(body.templateId || "");
    if (!(await isValidTemplateId(templateId))) {
      return NextResponse.json(
        { error: "Select a valid template" },
        { status: 400 },
      );
    }
    const template = await getTemplateAsync(templateId);
    await prisma.store.update({
      where: { id: storeId },
      data: {
        templateId: template.id,
        previewImage: template.preview,
      },
    });
  } else if (action === "delete") {
    await prisma.store.delete({ where: { id: storeId } });
  } else if (action === "duplicate") {
    const src = membership.store;
    const subdomain = `${src.subdomain}-copy-${Math.random().toString(36).slice(2, 5)}`;
    const copy = await prisma.store.create({
      data: {
        name: `${src.name} (Copy)`,
        slug: subdomain,
        subdomain,
        templateId: src.templateId,
        status: "draft",
        isPrimary: false,
        brandColor: src.brandColor,
        tagline: src.tagline,
        description: src.description,
        previewImage: src.previewImage,
        contactEmail: src.contactEmail,
        members: { create: { userId: session.user.id, role: "owner" } },
      },
    });
    const products = await prisma.product.findMany({
      where: { storeId: src.id },
      include: { variants: true },
    });
    for (const p of products) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          imageUrl: p.imageUrl,
          status: p.status,
          storeId: copy.id,
          variants: {
            create: p.variants.map((v) => ({
              label: v.label,
              sku: v.sku,
              price: v.price,
              compareAt: v.compareAt,
              stock: v.stock,
            })),
          },
        },
      });
    }
    return NextResponse.json({ id: copy.id });
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
