import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fiyat kurtarma işlemi başlatılıyor...");
  
  // Update price and retailPrice to match wholesalePrice where wholesalePrice is not null/0
  const result = await prisma.$executeRaw`UPDATE "ProductVariant" SET price = "wholesalePrice", "retailPrice" = "wholesalePrice" WHERE price = 0`;
  
  console.log(`Fiyatlar başarıyla geri yüklendi! Etkilenen kayıt sayısı: ${result}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
