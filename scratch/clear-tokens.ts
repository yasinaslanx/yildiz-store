import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.passwordResetToken.deleteMany();
  console.log("PasswordResetToken table cleared.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
