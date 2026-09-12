import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.upsert({
    where: { slug: "demo" },
    update: { name: "Demo Hardware Store" },
    create: {
      slug: "demo",
      name: "Demo Hardware Store",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@followup.dev" },
    update: { name: "Asha Patel", businessId: business.id },
    create: {
      email: "demo@followup.dev",
      name: "Asha Patel",
      businessId: business.id,
    },
  });

  const existingLeads = await prisma.lead.count({
    where: { businessId: business.id },
  });

  if (existingLeads === 0) {
    await prisma.lead.create({
      data: {
        businessId: business.id,
        name: "Ravi Kumar",
        phone: "+919876543210",
        status: "FOLLOW_UP",
        source: "WHATSAPP",
        notes: "Asked about bulk paint for a shop renovation.",
        activities: {
          create: {
            type: "CREATED",
            body: "Lead captured from WhatsApp.",
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
