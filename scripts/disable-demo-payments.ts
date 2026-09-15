/**
 * One-shot: turn off demo payments on every store so production cannot
 * mark orders paid without a real charge.
 *
 *   npx tsx scripts/disable-demo-payments.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.paymentMethod.updateMany({
    where: { type: "demo" },
    data: { enabled: false, isDefault: false },
  });
  console.log(`Disabled demo payments on ${result.count} store(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
