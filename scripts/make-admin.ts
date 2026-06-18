import { prisma } from '../src/lib/prisma';

async function makeAdmin() {
  const email = "aslanyasin320@gmail.com";
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" }
  });

  console.log(`User ${email} is now an ADMIN.`);
}

makeAdmin().catch(console.error).finally(() => prisma.$disconnect());
