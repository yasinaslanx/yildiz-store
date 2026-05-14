import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Kullanıcı şifreleri güncelleniyor...");

  const newPasswordHash = await bcrypt.hash("12345678", 10);

  const result = await prisma.user.updateMany({
    data: {
      passwordHash: newPasswordHash
    }
  });

  console.log(`${result.count} kullanıcının şifresi '12345678' olarak güncellendi.`);
}

main()
  .catch((error) => {
    console.error("Hata:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
