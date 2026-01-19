const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      slug: "vip1-test",
      name: "VIP 1 (Teste)",
      priceCents: 100, // R$1
      currency: "BRL",
      durationDays: 30,
      deliveryCommands: ["givevip {nick} vip1 {days}"],
      active: true,
    },
    {
      slug: "vip2-test",
      name: "VIP 2 (Teste)",
      priceCents: 100, // R$1
      currency: "BRL",
      durationDays: 30,
      deliveryCommands: ["givevip {nick} vip2 {days}"],
      active: true,
    },
  ];


  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log("✅ Seed concluído: produtos criados/atualizados.");
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
