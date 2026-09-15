/**
 * Production-safe catalog bootstrap.
 *
 * Creates the store + products + payment method rows. Does NOT invent fake
 * orders unless SEED_DEMO_DATA=true (local UI demos only).
 *
 * Admin account:
 *   ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME  — preferred
 *   Falls back to demo@mosmo.store only when NODE_ENV !== "production"
 *   and no ADMIN_EMAIL is set (local development).
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const isProd = process.env.NODE_ENV === "production";
  const seedDemoData = process.env.SEED_DEMO_DATA === "true";

  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    (isProd ? "" : "demo@mosmo.store")
  )
    .toLowerCase()
    .trim();
  const adminPassword =
    process.env.ADMIN_PASSWORD || (isProd ? "" : "demo1234");
  const adminName =
    process.env.ADMIN_NAME ||
    (adminEmail === "demo@mosmo.store" ? "Demo Merchant" : "Owner");

  if (!adminEmail || !adminPassword || adminPassword.length < 8) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) before seeding in production.",
    );
  }

  const passwordHash = await hash(adminPassword, 10);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: "moun-journey" },
    update: { name: "The Clinic" },
    create: {
      name: "The Clinic",
      slug: "moun-journey",
      subdomain: "moun-journey",
      templateId: "moun-journey",
      status: "live",
      isPrimary: true,
      contactEmail: adminEmail,
      tagline: "Wetenschappelijk bewezen behandelingen voor gewichtsverlies",
      description:
        "Bereik een gezond gewicht met medicatie ondersteund door wetenschap.",
      brandColor: "#004751",
      previewImage: "/products/mounjaro-pen.png",
      members: { create: { userId: user.id, role: "owner" } },
    },
  });

  // Ensure owner membership even if the store already existed
  await prisma.storeMember.upsert({
    where: {
      userId_storeId: { userId: user.id, storeId: store.id },
    },
    update: { role: "owner" },
    create: { storeId: store.id, userId: user.id, role: "owner" },
  });

  await prisma.category.upsert({
    where: { storeId_slug: { storeId: store.id, slug: "mounjaro" } },
    update: {},
    create: { name: "Mounjaro", slug: "mounjaro", storeId: store.id },
  });

  const catalog = [
    {
      name: "Mounjaro Injectiepen kopen",
      slug: "mounjaro-injectiepen-kopen",
      description:
        "Wekelijkse voorgevulde pen met tirzepatide. Helpt volwassenen met overgewicht om te verliezen. Alleen op recept.",
      imageUrl: "/products/mounjaro-pens-transparent.png",
      variants: [
        { label: "2.5 MG", price: 200, compareAt: 270, stock: 50 },
        { label: "5 MG", price: 250, compareAt: 320, stock: 50 },
        { label: "7.5 MG", price: 320, compareAt: 390, stock: 40 },
        { label: "10 MG", price: 350, compareAt: 420, stock: 40 },
        { label: "12.5 MG", price: 400, compareAt: 470, stock: 30 },
        { label: "15 MG", price: 410, compareAt: 480, stock: 30 },
      ],
    },
    {
      name: "Ozempic Injectiepen kopen",
      slug: "ozempic-injectiepen-kopen",
      description:
        "Wekelijkse voorgevulde pen met semaglutide. Helpt volwassenen met overgewicht om te verliezen. Alleen op recept.",
      imageUrl: "/products/ozempic-pens-transparent.png",
      variants: [
        { label: "1.0 MG", price: 179, compareAt: 249, stock: 80 },
        { label: "2.0 MG", price: 320, compareAt: 390, stock: 60 },
      ],
    },
  ];

  for (const item of catalog) {
    let product = await prisma.product.findFirst({
      where: { storeId: store.id, slug: item.slug },
    });
    if (!product) {
      product = await prisma.product.create({
        data: {
          storeId: store.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          imageUrl: item.imageUrl,
          status: "active",
        },
      });
    } else {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          status: "active",
        },
      });
    }

    for (const v of item.variants) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, label: v.label },
      });
      if (existing) {
        await prisma.productVariant.update({
          where: { id: existing.id },
          data: {
            price: v.price,
            compareAt: v.compareAt,
            stock: v.stock,
          },
        });
      } else {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            label: v.label,
            price: v.price,
            compareAt: v.compareAt,
            stock: v.stock,
          },
        });
      }
    }
  }

  await prisma.discount.upsert({
    where: { storeId_code: { storeId: store.id, code: "WELCOME10" } },
    update: {},
    create: {
      storeId: store.id,
      code: "WELCOME10",
      type: "percent",
      value: 10,
      active: true,
    },
  });

  // Payment methods — real processors off until configured; demo always off
  await prisma.paymentMethod.deleteMany({
    where: {
      storeId: store.id,
      type: { in: ["stripe", "ideal", "paypal"] },
    },
  });

  const paymentDefaults = [
    {
      type: "high_risk",
      name: "High-risk processor",
      enabled: false,
      isDefault: false,
      sortOrder: 0,
      config: JSON.stringify({
        providerName: "",
        apiBaseUrl: "",
        merchantId: "",
        apiKey: "",
        webhookSecret: "",
        checkoutUrl: "",
        instructions:
          "You will be redirected to our payment partner to complete your purchase securely.",
      }),
    },
    {
      type: "crypto",
      name: "Crypto payments",
      enabled: false,
      isDefault: false,
      sortOrder: 1,
      config: JSON.stringify({
        btcAddress: "",
        ethAddress: "",
        usdtAddress: "",
        networkNotes:
          "Send only on the network shown. Wrong network = lost funds.",
        instructions:
          "Send the exact order total in crypto and include the order number in the memo if supported.",
      }),
    },
    {
      type: "bank_transfer",
      name: "Bank transfer",
      enabled: false,
      isDefault: false,
      sortOrder: 2,
      config: JSON.stringify({
        accountName: "",
        iban: "",
        bic: "",
        instructions:
          "Transfer the order total and include the order number as reference.",
      }),
    },
    {
      type: "demo",
      name: "Demo payments",
      enabled: false,
      isDefault: false,
      sortOrder: 3,
      config: null as string | null,
    },
  ];

  for (const p of paymentDefaults) {
    await prisma.paymentMethod.upsert({
      where: { storeId_type: { storeId: store.id, type: p.type } },
      update:
        p.type === "demo"
          ? { enabled: false, isDefault: false }
          : {},
      create: { storeId: store.id, ...p },
    });
  }

  // Optional sandbox orders for local UI demos only
  if (seedDemoData) {
    const orderCount = await prisma.order.count({ where: { storeId: store.id } });
    if (orderCount < 8) {
      const variants = await prisma.productVariant.findMany({
        where: { product: { storeId: store.id } },
        include: { product: true },
        take: 6,
      });
      const demoCustomers = [
        { email: "anna@example.com", name: "Anna de Vries" },
        { email: "mark@example.com", name: "Mark Jansen" },
        { email: "sara@example.com", name: "Sara Bakker" },
        { email: "tom@example.com", name: "Tom Visser" },
      ];
      for (const c of demoCustomers) {
        await prisma.customer.upsert({
          where: { storeId_email: { storeId: store.id, email: c.email } },
          update: { name: c.name },
          create: { storeId: store.id, email: c.email, name: c.name },
        });
      }

      const samples = [
        { daysAgo: 0, status: "paid", customer: demoCustomers[0], variantIndex: 0, qty: 1 },
        { daysAgo: 1, status: "fulfilled", customer: demoCustomers[1], variantIndex: 1, qty: 1 },
        { daysAgo: 2, status: "paid", customer: demoCustomers[2], variantIndex: 2, qty: 2 },
        { daysAgo: 5, status: "fulfilled", customer: demoCustomers[3], variantIndex: 0, qty: 1 },
        { daysAgo: 8, status: "paid", customer: demoCustomers[0], variantIndex: 3, qty: 1 },
        { daysAgo: 12, status: "pending", customer: demoCustomers[1], variantIndex: 1, qty: 1 },
        { daysAgo: 18, status: "fulfilled", customer: demoCustomers[2], variantIndex: 4, qty: 1 },
        { daysAgo: 25, status: "refunded", customer: demoCustomers[3], variantIndex: 0, qty: 1 },
      ];

      for (const [i, sample] of samples.entries()) {
        const variant = variants[sample.variantIndex % Math.max(variants.length, 1)];
        if (!variant) continue;
        const customer = await prisma.customer.findUnique({
          where: {
            storeId_email: { storeId: store.id, email: sample.customer.email },
          },
        });
        const createdAt = new Date(Date.now() - sample.daysAgo * 86400000);
        const number = `MJ-DEMO-${String(i + 1).padStart(3, "0")}`;
        const exists = await prisma.order.findFirst({
          where: { storeId: store.id, number },
        });
        if (exists) continue;
        const shipStatus =
          sample.status === "fulfilled"
            ? "shipped"
            : sample.status === "refunded"
              ? "cancelled"
              : "unfulfilled";
        await prisma.order.create({
          data: {
            number,
            status: sample.status,
            email: sample.customer.email,
            customerName: sample.customer.name,
            total: variant.price * sample.qty,
            storeId: store.id,
            customerId: customer?.id,
            shippingAddress: JSON.stringify({
              phone: "+31 6 1234 5678",
              address: "Keizersgracht 100",
              city: "Amsterdam",
              zip: "1015 AA",
              country: "NL",
              paymentMethod: "bank_transfer",
            }),
            createdAt,
            updatedAt: createdAt,
            items: {
              create: [
                {
                  title: variant.product.name,
                  variantLabel: variant.label,
                  quantity: sample.qty,
                  unitPrice: variant.price,
                  variantId: variant.id,
                },
              ],
            },
            shipment: {
              create: {
                storeId: store.id,
                status: shipStatus,
                carrier: shipStatus === "shipped" ? "PostNL" : null,
                trackingNumber:
                  shipStatus === "shipped"
                    ? `3SDEMO${String(i + 1).padStart(9, "0")}`
                    : null,
                shippedAt: shipStatus === "shipped" ? createdAt : null,
              },
            },
          },
        });
      }
    }
    console.log("Seeded optional demo orders (SEED_DEMO_DATA=true)");
  }

  console.log(`Admin ready: ${adminEmail}`);
  console.log(`Store: ${store.subdomain} (${store.id})`);
  console.log("Demo payments: disabled");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
