import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart-server";
import {
  demoPaymentsAllowed,
  ensurePaymentMethods,
  parseConfig,
} from "@/lib/payments";
import { storePublicUrl } from "@/lib/tenancy";

export async function POST(req: Request) {
  const body = await req.json();
  const storeId = String(body.storeId || "");
  const email = String(body.email || "").trim();
  const customerName = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const address = String(body.address || "").trim();
  const city = String(body.city || "").trim();
  const zip = String(body.zip || "").trim();
  const country = String(body.country || "NL").trim() || "NL";
  const discountCode = String(body.discountCode || "")
    .trim()
    .toUpperCase();
  const requestedMethod = String(body.paymentMethod || "").trim();
  // Storefront checkout posts its (client-side) cart as direct line items
  const directItems = Array.isArray(body.items)
    ? (body.items as {
        productSlug?: string;
        variantLabel?: string;
        quantity?: number;
      }[])
    : null;
  const originRaw = String(body.origin || "").trim();
  const origin = /^https?:\/\//.test(originRaw)
    ? originRaw.replace(/\/$/, "")
    : "";

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store || store.status !== "live") {
    return NextResponse.json({ error: "Store unavailable" }, { status: 400 });
  }

  const methods = await ensurePaymentMethods(storeId);
  const enabled = methods.filter((m) => m.enabled);
  if (enabled.length === 0) {
    return NextResponse.json(
      { error: "No payment methods enabled. Configure Payments in admin." },
      { status: 400 },
    );
  }

  const method =
    enabled.find((m) => m.type === requestedMethod) ||
    enabled.find((m) => m.isDefault) ||
    enabled[0];

  if (method.type === "demo" && !demoPaymentsAllowed()) {
    return NextResponse.json(
      {
        error:
          "Demo payments are disabled in production. Enable a real payment method in Admin → Payments.",
      },
      { status: 400 },
    );
  }

  type OrderLine = {
    title: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
    variantId: string;
  };

  let lines: OrderLine[] = [];
  let serverCartId: string | null = null;

  if (directItems) {
    const slugs = [
      ...new Set(directItems.map((i) => String(i.productSlug || ""))),
    ].filter(Boolean);
    const variants = await prisma.productVariant.findMany({
      where: { product: { storeId, slug: { in: slugs } } },
      include: { product: true },
    });
    for (const item of directItems) {
      const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      const variant = variants.find(
        (v) =>
          v.product.slug === item.productSlug &&
          v.label === item.variantLabel,
      );
      if (!variant) {
        return NextResponse.json(
          { error: `Unknown product variant: ${item.variantLabel}` },
          { status: 400 },
        );
      }
      lines.push({
        title: variant.product.name,
        variantLabel: variant.label,
        quantity,
        unitPrice: variant.price,
        variantId: variant.id,
      });
    }
  } else {
    const cart = await getOrCreateCart(storeId);
    serverCartId = cart.id;
    lines = cart.items.map((i) => ({
      title: i.variant.product.name,
      variantLabel: i.variant.label,
      quantity: i.quantity,
      unitPrice: i.variant.price,
      variantId: i.variant.id,
    }));
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "Cart empty" }, { status: 400 });
  }

  let subtotal = lines.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (discountCode) {
    const discount = await prisma.discount.findFirst({
      where: { storeId, code: discountCode, active: true },
    });
    if (discount) {
      if (discount.type === "percent") {
        subtotal = subtotal * (1 - discount.value / 100);
      } else {
        subtotal = Math.max(0, subtotal - discount.value);
      }
    }
  }

  const number = `MJ-${Date.now().toString().slice(-8)}`;
  const customer = email
    ? await prisma.customer.upsert({
        where: { storeId_email: { storeId, email } },
        create: {
          storeId,
          email,
          name: customerName || null,
          phone: phone || null,
        },
        update: {
          name: customerName || undefined,
          phone: phone || undefined,
        },
      })
    : null;

  const config = parseConfig(method.config);
  // Keep payment instructions for success page; omit secrets from order meta
  const {
    apiKey: _apiKey,
    webhookSecret: _webhookSecret,
    merchantId: _merchantId,
    apiBaseUrl: _apiBaseUrl,
    ...safeConfig
  } = config;
  const order = await prisma.order.create({
    data: {
      number,
      status: "pending",
      email: email || "guest@example.com",
      customerName: customerName || null,
      total: Math.round(subtotal * 100) / 100,
      storeId,
      customerId: customer?.id,
      shippingAddress: JSON.stringify({
        phone,
        address,
        city,
        zip,
        country,
        paymentMethod: method.type,
        ...safeConfig,
      }),
      items: {
        create: lines.map((i) => ({
          title: i.title,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          variantId: i.variantId,
        })),
      },
      shipment: {
        create: {
          storeId,
          status: "unfulfilled",
        },
      },
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    storePublicUrl(store) ||
    "http://localhost:3000";
  // Storefront checkout returns to the main site; tenant checkout to /store/:sub
  const storeBase = origin
    ? origin
    : baseUrl.includes("/store/")
      ? baseUrl
      : `${baseUrl}/store/${store.subdomain}`;
  const successUrl = (params: string) =>
    origin
      ? `${storeBase}/bestelling-bevestigd?${params}`
      : `${storeBase}/checkout/success?${params}`;

  if (method.type === "demo") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
    if (serverCartId) {
      await prisma.cartItem.deleteMany({ where: { cartId: serverCartId } });
    }
    return NextResponse.json({
      demo: true,
      paymentMethod: "demo",
      url: successUrl(`order=${order.number}`),
      orderNumber: order.number,
    });
  }

  if (serverCartId) {
    await prisma.cartItem.deleteMany({ where: { cartId: serverCartId } });
  }

  // High-risk processor: redirect to hosted checkout when URL is configured
  if (method.type === "high_risk") {
    const checkoutUrl = (config.checkoutUrl || "").trim();
    if (checkoutUrl) {
      const url = new URL(checkoutUrl);
      url.searchParams.set("order", order.number);
      url.searchParams.set("amount", String(order.total));
      url.searchParams.set("currency", order.currency || "EUR");
      url.searchParams.set("email", order.email);
      url.searchParams.set(
        "return_url",
        successUrl(`order=${order.number}&method=high_risk`),
      );
      return NextResponse.json({
        paymentMethod: "high_risk",
        url: url.toString(),
        orderNumber: order.number,
      });
    }
    return NextResponse.json({
      paymentMethod: "high_risk",
      url: successUrl(`order=${order.number}&method=high_risk`),
      orderNumber: order.number,
    });
  }

  if (method.type === "crypto") {
    return NextResponse.json({
      paymentMethod: "crypto",
      url: successUrl(`order=${order.number}&method=crypto`),
      orderNumber: order.number,
      crypto: config,
    });
  }

  if (method.type === "bank_transfer") {
    return NextResponse.json({
      paymentMethod: "bank_transfer",
      url: successUrl(`order=${order.number}&method=bank`),
      orderNumber: order.number,
      bank: config,
    });
  }

  return NextResponse.json(
    { error: `Unsupported payment method: ${method.type}` },
    { status: 400 },
  );
}
