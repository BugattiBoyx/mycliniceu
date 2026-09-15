import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/tenancy";

function parseGallery(raw: unknown): string | null {
  if (Array.isArray(raw)) {
    const urls = raw.map(String).map((u) => u.trim()).filter(Boolean);
    return urls.length ? JSON.stringify(urls) : null;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const urls = parsed.map(String).map((u) => u.trim()).filter(Boolean);
        return urls.length ? JSON.stringify(urls) : null;
      }
    } catch {
      /* treat as single url */
    }
    return JSON.stringify([raw.trim()]);
  }
  return null;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = new URL(req.url).searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });
  const member = await prisma.storeMember.findFirst({
    where: { storeId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const products = await prisma.product.findMany({
    where: { storeId },
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const member = await prisma.storeMember.findFirst({
    where: { storeId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const name = String(body.name || "").trim();
  const slug = slugify(String(body.slug || name));
  const variants = Array.isArray(body.variants) ? body.variants : [{ label: "Default", price: 0 }];

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      galleryUrls: parseGallery(body.galleryUrls),
      status: body.status || "active",
      storeId,
      variants: {
        create: variants.map((v: { label: string; price: number; stock?: number }) => ({
          label: v.label,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 100,
        })),
      },
    },
    include: { variants: true },
  });
  return NextResponse.json(product);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const productId = String(body.productId || "");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.storeMember.findFirst({
    where: { storeId: existing.storeId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const name =
    body.name !== undefined ? String(body.name || "").trim() : existing.name;
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug =
    body.slug !== undefined
      ? slugify(String(body.slug || name))
      : existing.slug;

  const status =
    body.status !== undefined
      ? String(body.status || "active")
      : existing.status;

  const description =
    body.description !== undefined
      ? body.description
        ? String(body.description)
        : null
      : existing.description;

  const imageUrl =
    body.imageUrl !== undefined
      ? body.imageUrl
        ? String(body.imageUrl)
        : null
      : existing.imageUrl;

  const galleryUrls =
    body.galleryUrls !== undefined
      ? parseGallery(body.galleryUrls)
      : existing.galleryUrls;

  if (Array.isArray(body.variants)) {
    const incoming = body.variants as {
      id?: string;
      label: string;
      price: number;
      stock?: number;
    }[];
    const keepIds = incoming.map((v) => v.id).filter(Boolean) as string[];

    await prisma.$transaction(async (tx) => {
      if (keepIds.length) {
        await tx.productVariant.deleteMany({
          where: { productId, id: { notIn: keepIds } },
        });
      } else {
        await tx.productVariant.deleteMany({ where: { productId } });
      }

      for (const v of incoming) {
        const data = {
          label: String(v.label || "").trim() || "Default",
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 100,
        };
        if (v.id && existing.variants.some((ev) => ev.id === v.id)) {
          await tx.productVariant.update({ where: { id: v.id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId } });
        }
      }

      await tx.product.update({
        where: { id: productId },
        data: { name, slug, description, imageUrl, galleryUrls, status },
      });
    });
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: { name, slug, description, imageUrl, galleryUrls, status },
    });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await req.json();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const member = await prisma.storeMember.findFirst({
    where: { storeId: product.storeId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ ok: true });
}
