import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "admin@titifarm.com" },
    update: { role: "ADMIN", name: "Admin" },
    create: {
      email: "admin@titifarm.com",
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ userId: user.id, email: user.email, role: user.role }));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

